"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AutocompleteInput from "@/components/ui/AutocompleteInput";
import TheatreCreateModal from "@/components/ui/TheatreCreateModal";
import {
  useRecording,
  useTheatres,
  usePeople,
  useAddRecording,
  useUpdateRecording,
  useAddPerson,
  useAddTheatre,
  RecordingInput,
} from "@/hooks/useQueries";

export default function RecordingEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";

  // Queries
  const { data: recording, isLoading: recordingLoading } = useRecording(id);
  const { data: theatres = [], isLoading: theatresLoading } = useTheatres();
  const { data: people = [], isLoading: peopleLoading } = usePeople();

  // Mutations
  const addRecordingMutation = useAddRecording();
  const updateRecordingMutation = useUpdateRecording();
  const addPersonMutation = useAddPerson();
  const addTheatreMutation = useAddTheatre();

  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [info, setInfo] = useState("");
  const [recordingDate, setRecordingDate] = useState("");
  const [selectedTheatreId, setSelectedTheatreId] = useState("");
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const [selectedComposerIds, setSelectedComposerIds] = useState<string[]>([]);
  const [selectedLyricistIds, setSelectedLyricistIds] = useState<string[]>([]);
  const [oneDriveLink, setOneDriveLink] = useState("");
  const [galleryImages, setGalleryImages] = useState("");
  const [datePrecision, setDatePrecision] = useState<"year" | "full">("full");

  // Theatre Create Modal state
  const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
  const [pendingTheatreName, setPendingTheatreName] = useState("");
  const [theatreCreateResolve, setTheatreCreateResolve] = useState<
    ((id: string) => void) | null
  >(null);

  // Load data when recording is fetched
  useEffect(() => {
    if (recording) {
      setTitle(recording.title || "");
      setImageUrl(recording.imageUrl || "");
      setInfo(recording.info || "");
      setOneDriveLink(recording.oneDriveLink || "");
      setGalleryImages(recording.galleryImages?.join("\n") || "");

      const recDate = recording.recordingDate?.toDate();
      if (recDate) {
        if (recording.datePrecision === "year") {
          setRecordingDate(recDate.getFullYear().toString());
          setDatePrecision("year");
        } else {
          setRecordingDate(recDate.toISOString().split("T")[0]);
          setDatePrecision("full");
        }
      } else {
        setRecordingDate("");
        setDatePrecision("full");
      }

      setSelectedTheatreId(recording.theatreRef?.id || "");

      // Fallback to refs if ids arrays are missing (backward compatibility)
      const artistIds =
        recording.artistIds || recording.artistRefs?.map((ref) => ref.id) || [];
      setSelectedArtistIds(artistIds);

      const composerIds =
        recording.composerIds ||
        recording.composerRefs?.map((ref) => ref.id) ||
        [];
      setSelectedComposerIds(composerIds);

      const lyricistIds =
        recording.lyricistIds ||
        recording.lyricistRefs?.map((ref) => ref.id) ||
        [];
      setSelectedLyricistIds(lyricistIds);
    }
  }, [recording]);

  const createNewPerson = async (name: string): Promise<string> => {
    try {
      const { Timestamp } = await import("firebase/firestore");
      const newPersonData = {
        name: name.trim(),
        info: "",
        dateAdded: Timestamp.now(),
        dateUpdated: Timestamp.now(),
      };

      const newId = await addPersonMutation.mutateAsync(newPersonData);
      return newId;
    } catch (error) {
      console.error("Error creating new person:", error);
      throw error;
    }
  };

  const createNewTheatre = async (name: string): Promise<string> => {
    return new Promise((resolve) => {
      setPendingTheatreName(name);
      setTheatreCreateResolve(() => resolve);
      setIsTheatreModalOpen(true);
    });
  };

  const handleTheatreCreate = async (
    name: string,
    city: string,
    country: string,
  ) => {
    try {
      const { Timestamp } = await import("firebase/firestore");
      const newTheatreData = {
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        dateAdded: Timestamp.now(),
        dateUpdated: Timestamp.now(),
      };

      const newId = await addTheatreMutation.mutateAsync(newTheatreData);

      if (theatreCreateResolve) {
        theatreCreateResolve(newId);
      }

      setIsTheatreModalOpen(false);
      setPendingTheatreName("");
      setTheatreCreateResolve(null);
    } catch (error) {
      console.error("Error creating new theatre:", error);
      throw error;
    }
  };

  const handleTheatreModalClose = () => {
    setIsTheatreModalOpen(false);
    setPendingTheatreName("");
    setTheatreCreateResolve(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const theatre = theatres.find((t) => t.id === selectedTheatreId);
      const artistNames = people
        .filter((p) => selectedArtistIds.includes(p.id))
        .map((p) => p.name);

      let recDate = new Date();
      let releaseYear = new Date().getFullYear();

      if (recordingDate) {
        if (datePrecision === "year") {
          const year = parseInt(recordingDate);
          if (!isNaN(year)) {
            releaseYear = year;
            recDate = new Date(year, 0, 1); // Jan 1st of that year
          }
        } else {
          const dateObj = new Date(recordingDate);
          if (!isNaN(dateObj.getTime())) {
            recDate = dateObj;
            releaseYear = dateObj.getFullYear();
          }
        }
      }

      const recordingData: RecordingInput = {
        title,
        imageUrl,
        info,
        oneDriveLink,
        galleryImages: galleryImages.trim()
          ? galleryImages
              .split("\n")
              .map((url) => url.trim())
              .filter((url) => url.length > 0)
          : undefined,
        releaseYear,
        recordingDate: recDate,
        datePrecision,
        artistNames,
        artistIds: selectedArtistIds,
        composerIds: selectedComposerIds,
        lyricistIds: selectedLyricistIds,
      };

      // Add theatre data if selected
      if (theatre && selectedTheatreId) {
        recordingData.theatreId = selectedTheatreId;
        recordingData.theatreName = theatre.name;
        recordingData.city = theatre.city;
      }

      if (!isNew) {
        await updateRecordingMutation.mutateAsync({ id, data: recordingData });
      } else {
        await addRecordingMutation.mutateAsync(recordingData);
      }

      router.push("/admin/recordings");
    } catch (error) {
      console.error("Error saving recording:", error);
      setSaving(false);
    }
  };

  const theatreOptions = theatres.map((t) => ({
    id: t.id,
    label: `${t.name} (${t.city})`,
  }));

  const peopleOptions = people.map((p) => ({
    id: p.id,
    label: p.name,
  }));

  if (recordingLoading || theatresLoading || peopleLoading)
    return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif text-primary">
          {isNew ? "Add Recording" : "Edit Recording"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recording Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={recordingDate}
                onChange={(e) => setRecordingDate(e.target.value)}
                placeholder={
                  datePrecision === "year" ? "YYYY (e.g. 1995)" : "YYYY-MM-DD"
                }
                pattern={
                  datePrecision === "year"
                    ? "^\\d{4}$"
                    : "^\\d{4}-\\d{2}-\\d{2}$"
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="date"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      if (datePrecision === "year") {
                        setRecordingDate(val.split("-")[0]);
                      } else {
                        setRecordingDate(val);
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Select from calendar"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Precision
            </label>
            <select
              value={datePrecision}
              onChange={(e) => {
                const newPrecision = e.target.value as "year" | "full";
                setDatePrecision(newPrecision);
                // Clear date if switching format to avoid confusion, or try to convert?
                // Let's try to convert if possible
                if (recordingDate) {
                  if (newPrecision === "year" && recordingDate.includes("-")) {
                    setRecordingDate(recordingDate.split("-")[0]);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="full">Full Date</option>
              <option value="year">Year Only</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-4">
          {datePrecision === "year"
            ? "Enter the 4-digit release year."
            : "Enter the exact recording date."}
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OneDrive Link
          </label>
          <input
            type="url"
            value={oneDriveLink}
            onChange={(e) => setOneDriveLink(e.target.value)}
            placeholder="Paste OneDrive shared link here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gallery Images
          </label>
          <textarea
            value={galleryImages}
            onChange={(e) => setGalleryImages(e.target.value)}
            rows={4}
            placeholder="Paste image URLs here, one per line..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter one image URL per line. These will be displayed in a carousel.
          </p>
        </div>

        <AutocompleteInput
          label="Theatre"
          placeholder="Search for a theatre..."
          options={theatreOptions}
          selectedIds={selectedTheatreId ? [selectedTheatreId] : []}
          onSelect={(id) => setSelectedTheatreId(id)}
          onRemove={() => setSelectedTheatreId("")}
          allowCreate={true}
          onCreateNew={createNewTheatre}
        />

        <AutocompleteInput
          label="Composers"
          placeholder="Search for composers..."
          options={peopleOptions}
          selectedIds={selectedComposerIds}
          onSelect={(id) => setSelectedComposerIds((prev) => [...prev, id])}
          onRemove={(id) =>
            setSelectedComposerIds((prev) => prev.filter((i) => i !== id))
          }
          allowCreate={true}
          onCreateNew={createNewPerson}
        />

        <AutocompleteInput
          label="Lyricists"
          placeholder="Search for lyricists..."
          options={peopleOptions}
          selectedIds={selectedLyricistIds}
          onSelect={(id) => setSelectedLyricistIds((prev) => [...prev, id])}
          onRemove={(id) =>
            setSelectedLyricistIds((prev) => prev.filter((i) => i !== id))
          }
          allowCreate={true}
          onCreateNew={createNewPerson}
        />

        <AutocompleteInput
          label="Artists"
          placeholder="Search for artists..."
          options={peopleOptions}
          selectedIds={selectedArtistIds}
          onSelect={(id) => setSelectedArtistIds((prev) => [...prev, id])}
          onRemove={(id) =>
            setSelectedArtistIds((prev) => prev.filter((i) => i !== id))
          }
          allowCreate={true}
          onCreateNew={createNewPerson}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            rows={3}
            placeholder="Additional notes about this recording..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : isNew ? "Add Recording" : "Save Changes"}
          </button>
        </div>
      </form>

      <TheatreCreateModal
        isOpen={isTheatreModalOpen}
        theatreName={pendingTheatreName}
        onClose={handleTheatreModalClose}
        onCreate={handleTheatreCreate}
      />
    </div>
  );
}
