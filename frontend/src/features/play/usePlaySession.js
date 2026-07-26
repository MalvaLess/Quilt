import { useState, useCallback } from "react";
import { api } from "../../api/client";

export function usePlaySession(slug) {
  const [token, setToken] = useState(null);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNext = useCallback(async (tok) => {
    setLoading(true);
    try {
      const data = await api.getNextModule(tok);
      setCurrent(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const start = useCallback(
    async (playerLabel) => {
      setLoading(true);
      try {
        const { token } = await api.startSession(slug, playerLabel);
        setToken(token);
        await loadNext(token);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [slug, loadNext],
  );

  const answer = async (questionId, text) => {
    await api.submitAnswer(token, questionId, text);
    await loadNext(token);
  };

  const skip = async (questionId) => {
    await api.skipQuestion(token, questionId);
    await loadNext(token);
  };

  const answerPhoto = async (questionId, file) => {
    await api.submitPhotoAnswer(token, questionId, file);
    await loadNext(token);
  };

  return { token, current, loading, error, start, answer, skip, answerPhoto };
}
