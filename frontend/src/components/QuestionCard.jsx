import { useState } from "react";
import { resolveImageUrl } from "../api/client";

export default function QuestionCard({ question, onSubmit, onSkip, onSubmitPhoto }) {
  const [answer, setAnswer] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const handleSubmit = () => {
    onSubmit(answer);
    setAnswer("");
  };

  const handlePhotoSelect = (file) => {
    if (!file) return;
    setPhotoError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoSubmit = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      await onSubmitPhoto(photoFile);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e) {
      setPhotoError(e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="relative screen-enter">
      <div className="absolute left-5 right-5 -bottom-2 h-2 bg-parchment-dim/60 rounded-b-2xl -z-10" />
      <div className="bg-parchment text-void-2 rounded-2xl p-6">
        <span className="font-mono text-xs uppercase tracking-widest text-gem-dark">
          pregunta
        </span>
        {question.image_url && (
          <img
            src={resolveImageUrl(question.image_url)}
            alt=""
            className="w-full max-h-48 object-cover rounded-xl mt-3"
          />
        )}
        <p className="font-display text-2xl leading-tight mt-2">
          {question.prompt}
        </p>

        {question.input_type === "photo" ? (
          <div className="mt-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt=""
                className="w-full max-h-56 object-cover rounded-xl mb-3"
              />
            )}
            <label className="btn-ghost block text-center w-full rounded-lg border border-dashed border-[#d3c9b8] bg-[#fbf8f2] p-3 text-xs cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoSelect(e.target.files?.[0] ?? null)}
              />
              {photoFile ? photoFile.name : "elegí una foto..."}
            </label>
            {photoError && <p className="text-gem text-xs mt-2">{photoError}</p>}
          </div>
        ) : question.input_type === "multiple_choice" && question.options?.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 mt-4">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`tile-interactive text-left rounded-lg border p-3 text-sm transition-colors ${
                  answer === opt
                    ? "border-gem bg-gem/10 font-semibold"
                    : "border-[#d3c9b8] bg-[#fbf8f2]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="escribí lo que quieras..."
            className="w-full mt-4 rounded-lg border border-[#d3c9b8] bg-[#fbf8f2] p-3 text-sm resize-none min-h-[70px] focus:outline-none focus:border-gem"
          />
        )}

        <button
          onClick={question.input_type === "photo" ? handlePhotoSubmit : handleSubmit}
          disabled={
            (question.input_type === "multiple_choice" && !answer) ||
            (question.input_type === "photo" && (!photoFile || uploadingPhoto))
          }
          className="btn-fill w-full mt-4 bg-gem text-parchment font-semibold rounded-xl py-3.5 shadow-[0_6px_0_var(--color-gem-dark)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-gem-dark)] transition-transform disabled:opacity-40 disabled:pointer-events-none"
        >
          {question.input_type === "photo" && uploadingPhoto
            ? "subiendo..."
            : "Guardar y sumar puntos"}
        </button>

        <button
          onClick={onSkip}
          className="btn-text w-full mt-2.5 text-center text-xs text-gem-dark/70 underline"
        >
          no quiero responder esta, dame otra »
        </button>
      </div>
    </div>
  );
}
