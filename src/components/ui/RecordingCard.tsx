'use client';

import Link from 'next/link';
import LoadingImage from '@/components/ui/LoadingImage';
import { Recording } from '@/types';
import { formatDateDisplay } from '@/utils/dateUtils';

interface RecordingCardProps {
    recording: Recording & { id: string };
}

export default function RecordingCard({ recording }: RecordingCardProps) {
    return (
        <Link href={`/recordings/${recording.id}`} className="group h-full block">
            <div className="bg-surface rounded-lg shadow-sm overflow-hidden border border-transparent transition-all hover:shadow-md hover:border-accent/50 h-full flex flex-col">
                {/* Image Section */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-surface/50 h-48 relative border-b border-accent/10">
                    {recording.imageUrl ? (
                        <LoadingImage
                            src={recording.imageUrl}
                            alt={recording.title}
                            fill
                            unoptimized
                            className="object-cover object-center group-hover:opacity-90 transition-opacity"
                            containerClassName="h-full w-full"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-foreground/40">
                            <NoImagePlaceholder />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-primary mb-1 font-serif line-clamp-2" title={recording.title}>
                        {recording.title}
                    </h3>

                    {(recording.theatreName || recording.city) && (
                        <p className="text-sm text-foreground/70 mb-0 line-clamp-1">
                            {recording.theatreName}
                            {recording.theatreName && recording.city && ', '}
                            {recording.city}
                        </p>
                    )}

                    <div className="pt-1 mt-1 border-t border-accent/10">
                        <p className="text-sm text-foreground/60">
                            {formatDateDisplay({
                                recordingDate: recording.recordingDate,
                                releaseYear: recording.releaseYear,
                                datePrecision: recording.datePrecision
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function NoImagePlaceholder() {
    return (
        <svg className="h-12 w-12 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
    );
}
