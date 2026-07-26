const API_URL = import.meta.env.VITE_API_URL;
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveImageUrl(path) {
  return path ? `${API_ORIGIN}${path}` : null;
}

async function request(path, options = {}) {
  const token = localStorage.getItem("quilt_token");
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.detail || "Error en la petición");
    error.status = res.status;
    throw error;
  }
  return res.json();
}

async function uploadRequest(path, formData) {
  const token = localStorage.getItem("quilt_token");
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.detail || "Error subiendo el archivo");
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export const api = {
  getExperienceInfo: (slug) => request(`/play/e/${slug}`),
  startSession: (slug, playerName) =>
    request(`/play/start/${slug}?player_name=${encodeURIComponent(playerName)}`, {
      method: "POST",
    }),
  getNextModule: (token) => request(`/play/${token}`),
  submitAnswer: (token, questionId, responseText) =>
    request(`/play/${token}/answers`, {
      method: "POST",
      body: JSON.stringify({
        question_id: questionId,
        response_text: responseText,
      }),
    }),
  skipQuestion: (token, questionId) =>
    request(`/play/${token}/skip`, {
      method: "POST",
      body: JSON.stringify({ question_id: questionId }),
    }),
  submitPhotoAnswer: (token, questionId, file) => {
    const formData = new FormData();
    formData.append("question_id", questionId);
    formData.append("file", file);
    return uploadRequest(`/play/${token}/answers/photo`, formData);
  },
  getRewards: (token) => request(`/play/${token}/rewards`),
  createCustomReward: (token, data) =>
    request(`/play/${token}/custom-rewards`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  selectReward: (token, { rewardOptionId, customRewardId }, chosenDate, chosenTime) =>
    request(`/play/${token}/reward-selection`, {
      method: "POST",
      body: JSON.stringify({
        reward_option_id: rewardOptionId ?? null,
        custom_reward_id: customRewardId ?? null,
        chosen_date: chosenDate,
        chosen_time: chosenTime,
      }),
    }),
  register: (email, password, displayName) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, display_name: displayName }),
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getCurrentCreator: () => request("/auth/me"),
  listExperiences: () => request("/experiences/"),
  listMyExperiences: () => request("/experiences/mine"),
  getPlayers: (experienceId) => request(`/experiences/${experienceId}/players`),
  getExperienceFull: (id) => request(`/experiences/${id}/full`),
  createExperience: (data) =>
    request(`/experiences/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateExperience: (id, data) =>
    request(`/experiences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteExperience: (id) =>
    request(`/experiences/${id}`, {
      method: "DELETE",
    }),
  createModule: (experienceId, data) =>
    request(`/experiences/${experienceId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateModule: (moduleId, data) =>
    request(`/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteModule: (moduleId) =>
    request(`/modules/${moduleId}`, {
      method: "DELETE",
    }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadRequest("/uploads/images", formData);
  },
  deleteImage: (imageId) =>
    request(`/uploads/images/${imageId}`, {
      method: "DELETE",
    }),
};
