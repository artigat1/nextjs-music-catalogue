import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

let env;
const projectId = 'demo-music-catalogue';
const signedIn = (role, verified = true) => env.authenticatedContext(role, {
  email: `${role}@example.com`, email_verified: verified,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
    storage: { rules: await readFile('storage.rules', 'utf8') },
  });
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const role of ['viewer', 'editor', 'admin', 'invalid']) {
      await db.doc(`users/${role}@example.com`).set({ email: `${role}@example.com`, role });
    }
    for (const name of ['recordings', 'people', 'theatres']) {
      await db.doc(`${name}/example`).set({ title: 'Private fixture' });
    }
    await context.storage().ref('recordings/example/main/image.png').putString('private image');
  });
});
after(async () => { await env?.cleanup(); });

for (const identity of ['anonymous', 'outsider', 'invalid', 'unverified']) {
  test(`${identity} cannot read or write catalogue data or storage`, async () => {
    const context = identity === 'anonymous' ? env.unauthenticatedContext()
      : identity === 'unverified' ? signedIn('viewer', false) : signedIn(identity);
    const db = context.firestore();
    for (const name of ['recordings', 'people', 'theatres']) {
      await assertFails(db.collection(name).get());
      await assertFails(db.doc(`${name}/example`).get());
      await assertFails(db.doc(`${name}/new`).set({ title: 'Forbidden' }));
    }
    await assertFails(db.collection('users').get());
    await assertFails(db.doc('users/admin@example.com').get());
    await assertFails(context.storage().ref('recordings/example/main/image.png').getMetadata());
    await assertFails(context.storage().ref('recordings/example/main/new.png').putString('forbidden'));
  });
}

for (const role of ['viewer', 'editor', 'admin']) {
  test(`${role} can read the catalogue and images`, async () => {
    const context = signedIn(role);
    for (const name of ['recordings', 'people', 'theatres']) {
      await assertSucceeds(context.firestore().collection(name).get());
      await assertSucceeds(context.firestore().doc(`${name}/example`).get());
    }
    await assertSucceeds(context.firestore().doc(`users/${role}@example.com`).get());
    await assertSucceeds(context.storage().ref('recordings/example/main/image.png').getMetadata());
  });
}

test('viewer cannot write, list users, or promote themselves', async () => {
  const context = signedIn('viewer');
  for (const name of ['recordings', 'people', 'theatres']) {
    await assertFails(context.firestore().doc(`${name}/example`).update({ title: 'Forbidden' }));
    await assertFails(context.firestore().doc(`${name}/example`).delete());
  }
  await assertFails(context.firestore().collection('users').get());
  await assertFails(context.firestore().doc('users/viewer@example.com').update({ role: 'admin' }));
  await assertFails(context.storage().ref('recordings/example/main/new.png').putString('forbidden'));
  await assertFails(context.storage().ref('recordings/example/main/image.png').delete());
});

for (const role of ['editor', 'admin']) {
  test(`${role} can maintain recordings and images`, async () => {
    const context = signedIn(role);
    for (const name of ['recordings', 'people', 'theatres']) {
      const ref = context.firestore().doc(`${name}/${role}`);
      await assertSucceeds(ref.set({ title: 'Allowed' }));
      await assertSucceeds(ref.update({ title: 'Updated' }));
      await assertSucceeds(ref.delete());
    }
    const image = context.storage().ref(`recordings/example/main/${role}.png`);
    await assertSucceeds(image.putString('allowed'));
    await assertSucceeds(image.delete());
  });
}

test('only admins manage the allowlist', async () => {
  const editor = signedIn('editor').firestore();
  await assertFails(editor.collection('users').get());
  await assertFails(editor.doc('users/new@example.com').set({ email: 'new@example.com', role: 'admin' }));
  const admin = signedIn('admin').firestore();
  await assertSucceeds(admin.collection('users').get());
  const entry = admin.doc('users/new@example.com');
  await assertSucceeds(entry.set({ email: 'new@example.com', role: 'viewer' }));
  await assertSucceeds(entry.update({ role: 'editor' }));
  await assertFails(entry.update({ role: 'owner' }));
  await assertSucceeds(entry.delete());
});

test('unlisted users can check their own missing allowlist document', async () => {
  await assertSucceeds(signedIn('outsider').firestore().doc('users/outsider@example.com').get());
});

test('email lookup is case insensitive and unknown paths remain private', async () => {
  const context = env.authenticatedContext('mixed-case', { email: 'Viewer@Example.COM', email_verified: true });
  await assertSucceeds(context.firestore().collection('recordings').get());
  await assertFails(context.firestore().doc('unknown/example').set({ secret: true }));
  await assertFails(context.firestore().doc('unknown/example').get());
});

test('removing an allowlist entry revokes existing-session data access', async () => {
  await env.withSecurityRulesDisabled(async context => {
    await context.firestore().doc('users/revoked@example.com').set({ email: 'revoked@example.com', role: 'viewer' });
  });
  const context = signedIn('revoked');
  await assertSucceeds(context.firestore().collection('recordings').get());
  await env.withSecurityRulesDisabled(async admin => {
    await admin.firestore().doc('users/revoked@example.com').delete();
  });
  await assertFails(context.firestore().collection('recordings').get());
  await assertFails(context.storage().ref('recordings/example/main/image.png').getMetadata());
});

test('user documents require a matching lowercase email', async () => {
  const admin = signedIn('admin').firestore();
  await assertFails(admin.doc('users/Mixed@Example.com').set({ email: 'Mixed@Example.com', role: 'viewer' }));
  await env.withSecurityRulesDisabled(async context => {
    await context.firestore().doc('users/legacy@example.com').set({ role: 'viewer' });
  });
  await assertFails(admin.doc('users/legacy@example.com').update({ role: 'editor' }));
  await assertSucceeds(admin.doc('users/legacy@example.com').update({ email: 'legacy@example.com', role: 'editor' }));
});

test('even admins cannot access storage outside recording paths', async () => {
  const image = signedIn('admin').storage().ref('other/image.png');
  await assertFails(image.putString('forbidden'));
  await assertFails(image.getMetadata());
});
