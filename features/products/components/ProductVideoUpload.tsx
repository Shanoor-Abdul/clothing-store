"use client";

import { Upload, Trash2, Play } from "lucide-react";

interface ProductVideo {
  id?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

interface ProductVideoUploadProps {
  videos: ProductVideo[];
  onUpload: (files: FileList) => void;
  onDelete: (index: number) => void;
}

const ProductVideoUpload = ({
  videos,
  onUpload,
  onDelete,
}: ProductVideoUploadProps) => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            Product Videos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload product videos
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">

          <Upload size={18} />

          Upload Videos

          <input
            type="file"
            multiple
            accept="video/*"
            hidden
            onChange={(e) => {
              if (e.target.files) {
                onUpload(e.target.files);
              }
            }}
          />

        </label>

      </div>

      {videos.length === 0 ? (
        <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-slate-300">

          <div className="text-center">

            <Upload
              size={40}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-slate-500">
              No Videos Uploaded
            </p>

          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {videos.map((video, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border"
            >

              <video
                src={video.videoUrl}
                controls
                className="h-56 w-full object-cover"
              />

              <div className="flex items-center justify-between border-t p-4">

                <div className="flex items-center gap-2">

                  <Play
                    size={18}
                    className="text-blue-600"
                  />

                  <span className="text-sm text-slate-600">
                    {video.duration
                      ? `${video.duration}s`
                      : "Video"}
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(index)
                  }
                  className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ProductVideoUpload;