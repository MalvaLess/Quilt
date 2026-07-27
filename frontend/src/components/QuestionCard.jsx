import { useState } from "react";
import { resolveImageUrl } from "../api/client";
import PlayerButton from "./PlayerButton";
import SelectableOption from "./SelectableOption";
import PointsBar from "./PointsBar";

const TYPE_LABEL = {
  text: "Respuesta libre",
  multiple_choice: "Opción múltiple",
  photo: "Subir foto",
};

export default function QuestionCard({ question, points, neededPoints, rewardsUnlocked, onJumpToRewards, onSubmit, onSkip, onSubmitPhoto }) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PointsBar points={points} neededPoints={neededPoints} />

      <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.5)" }}>
        Pregunta · {TYPE_LABEL[question.input_type] ?? "Pregunta"}
      </div>

      {question.image_url && (
        <img src={resolveImageUrl(question.image_url)} alt="" style={{ width: "100%", maxHeight: 192, objectFit: "cover", borderRadius: 12 }} />
      )}

      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 18, lineHeight: 1.3 }}>{question.prompt}</div>

      {question.input_type === "photo" ? (
        <div style={{ height: 150 }}>
          {photoPreview ? (
            <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
          ) : (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                borderRadius: 12,
                border: "1.5px dashed rgba(255,255,255,0.2)",
                color: "rgba(233,233,237,0.55)",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhotoSelect(e.target.files?.[0] ?? null)} />
              Arrastrá o tocá para subir
            </label>
          )}
          {photoFile && !photoPreview && <p style={{ fontSize: 12, marginTop: 8 }}>{photoFile.name}</p>}
          {photoError && <p style={{ color: "#ff2d4f", fontSize: 12, marginTop: 8 }}>{photoError}</p>}
        </div>
      ) : question.input_type === "multiple_choice" && question.options?.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt) => (
            <SelectableOption key={opt} label={opt} selected={answer === opt} onClick={() => setAnswer(opt)} />
          ))}
        </div>
      ) : (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escribí tu respuesta..."
          style={{ height: 64, resize: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 12px", color: "#e9e9ed", fontFamily: "Inter,system-ui,sans-serif", fontSize: 14 }}
        />
      )}

      {rewardsUnlocked && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 12px" }}>
          <div style={{ fontSize: 12, color: "rgba(233,233,237,0.75)" }}>🎁 Ya desbloqueaste una recompensa</div>
          <div onClick={onJumpToRewards} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gem-light)", cursor: "pointer", whiteSpace: "nowrap" }}>
            Ver recompensas
          </div>
        </div>
      )}

      <div>
        <PlayerButton
          label={question.input_type === "photo" && uploadingPhoto ? "subiendo..." : "Siguiente"}
          onClick={question.input_type === "photo" ? handlePhotoSubmit : handleSubmit}
          disabled={
            (question.input_type === "multiple_choice" && !answer) ||
            (question.input_type === "photo" && (!photoFile || uploadingPhoto))
          }
        />
      </div>

      <div onClick={onSkip} style={{ textAlign: "center", fontSize: 12, color: "rgba(233,233,237,0.45)", cursor: "pointer", textDecoration: "underline" }}>
        no quiero responder esta, dame otra »
      </div>
    </div>
  );
}
