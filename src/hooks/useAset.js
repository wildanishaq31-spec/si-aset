import { useState, useEffect, useCallback } from 'react';
import { getAsetData, saveAsetData, saveBulkAsetData, deleteAsetData } from '../services/asetService';

/**
 * Hook untuk mengelola data aset berdasarkan tipe.
 * @param {string} type - Tipe aset: 'kendaraan' | 'peralatan' | 'mesin' | 'alkes' | 'rumah-dinas'
 */
export function useAset(type) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!type) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAsetData(type);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('useAset fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const save = useCallback(
    async (payload) => {
      const result = await saveAsetData(type, payload);
      await fetchData(); // Refresh data setelah save
      return result;
    },
    [type, fetchData]
  );

  const bulkSave = useCallback(
    async (dataArray) => {
      const result = await saveBulkAsetData(type, dataArray);
      await fetchData(); // Refresh data setelah bulk save
      return result;
    },
    [type, fetchData]
  );

  const remove = useCallback(
    async (id) => {
      await deleteAsetData(type, id);
      await fetchData(); // Refresh data setelah delete
    },
    [type, fetchData]
  );

  return { data, loading, error, refetch: fetchData, save, bulkSave, remove };
}
