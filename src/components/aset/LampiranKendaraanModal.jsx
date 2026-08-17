// ============================================================
// LampiranKendaraanModal.jsx — Modal Lampiran Foto Kendaraan
// Terintegrasi dengan RustFS Storage & Riwayat Tanggal Foto
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { uploadFileToRustFS } from '../../services/storageService';

/**
 * Helper untuk mem-parsing data foto dari Firebase/CSV ke format array [{ url, date }]
 */
function parsePhotoList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (typeof item === 'string') return { url: item, date: 'Foto Awal' };
      return item;
    });
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        // Handle double-escaped JSON strings if any
        const cleaned = trimmed.replace(/\\"/g, '"');
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.url) return [parsed];
      } catch (e) {
        // fallback
      }
    }
    if (trimmed.startsWith('http')) {
      return [{ url: trimmed, date: 'Foto Awal' }];
    }
  }
  return [];
}

/**
 * Helper format tanggal Indonesia DD-MM-YYYY
 */
function getTodayDateStr() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function LampiranKendaraanModal({
  show,
  item,
  onClose,
  onSave,
}) {
  const [stnkList, setStnkList] = useState([]);
  const [pajakList, setPajakList] = useState([]);
  const [kendaraanList, setKendaraanList] = useState([]);

  const [stnkIdx, setStnkIdx] = useState(0);
  const [pajakIdx, setPajakIdx] = useState(0);
  const [kendaraanIdx, setKendaraanIdx] = useState(0);

  const [uploading, setUploading] = useState({ stnk: false, pajak: false, kendaraan: false });
  const [saving, setSaving] = useState(false);
  const [zoomData, setZoomData] = useState(null);

  const stnkInputRef = useRef(null);
  const pajakInputRef = useRef(null);
  const kendaraanInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      const stnk = parsePhotoList(item.FOTO_STNK || item.foto_stnk);
      const pajak = parsePhotoList(item.FOTO_PAJAK || item.foto_pajak);
      const kdrn = parsePhotoList(item.FOTO_KENDARAAN || item.foto_kendaraan);

      setStnkList(stnk);
      setPajakList(pajak);
      setKendaraanList(kdrn);

      setStnkIdx(Math.max(0, stnk.length - 1));
      setPajakIdx(Math.max(0, pajak.length - 1));
      setKendaraanIdx(Math.max(0, kdrn.length - 1));
    }
  }, [item, show]);

  if (!show || !item) return null;

  // Handle Upload Foto ke RustFS
  const handleUploadFile = async (e, category) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Sub-folder terstruktur sesuai standar RustFS
    let folder = 'KENDARAAN/LAMPIRAN FOTO/FOTO KENDARAAN';
    if (category === 'stnk') folder = 'KENDARAAN/LAMPIRAN FOTO/FOTO STNK';
    if (category === 'pajak') folder = 'KENDARAAN/LAMPIRAN FOTO/FOTO PAJAK';

    setUploading((prev) => ({ ...prev, [category]: true }));

    // Buat URL preview lokal langsung agar foto langsung tampil seketika
    const localBlobUrl = URL.createObjectURL(file);

    try {
      const { publicUrl, downloadUrl } = await uploadFileToRustFS(file, folder);
      const newEntry = {
        url: downloadUrl || publicUrl,
        publicUrl: publicUrl,
        downloadUrl: downloadUrl,
        previewUrl: localBlobUrl,
        date: getTodayDateStr(),
        fileName: file.name,
      };

      // Cek apakah data sebelumnya hanya berisi dummy "Foto Awal" / link lama
      const isInitialDummy = (list) => {
        if (!list || list.length === 0) return true;
        return list.every(
          (x) => x.date === 'Foto Awal' || !x.url || x.url.includes('drive.google.com')
        );
      };

      if (category === 'stnk') {
        const updated = isInitialDummy(stnkList) ? [newEntry] : [...stnkList, newEntry];
        setStnkList(updated);
        setStnkIdx(updated.length - 1);
      } else if (category === 'pajak') {
        const updated = isInitialDummy(pajakList) ? [newEntry] : [...pajakList, newEntry];
        setPajakList(updated);
        setPajakIdx(updated.length - 1);
      } else if (category === 'kendaraan') {
        const updated = isInitialDummy(kendaraanList) ? [newEntry] : [...kendaraanList, newEntry];
        setKendaraanList(updated);
        setKendaraanIdx(updated.length - 1);
      }
    } catch (err) {
      alert(`Gagal mengunggah foto: ${err.message}`);
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
      e.target.value = ''; // reset file input
    }
  };

  // Simpan perubahan lampiran ke Firebase Realtime Database
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...item,
        FOTO_STNK: JSON.stringify(stnkList),
        FOTO_PAJAK: JSON.stringify(pajakList),
        FOTO_KENDARAAN: JSON.stringify(kendaraanList),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      alert(`Gagal menyimpan lampiran: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Render individual photo card (STNK, Pajak, Fisik Kendaraan)
  const renderPhotoCard = (title, list, activeIdx, setIdx, category, inputRef) => {
    const current = list[activeIdx] || null;
    const hasMultiple = list.length > 1;
    const isUp = uploading[category];
    const imgSrc = current?.previewUrl || current?.downloadUrl || current?.url || null;

    return (
      <div className="col-md-4">
        <div className="card h-100 border shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="card-header bg-light py-2 text-center fw-bold text-dark border-bottom small">
            {title}
          </div>

          <div className="card-body p-2 d-flex flex-column justify-content-between">
            {/* Top Bar: Date Badge & Zoom Button */}
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <span className="badge bg-dark bg-opacity-75 text-white fw-normal font-monospace small">
                🕒 {current?.date || getTodayDateStr()}
              </span>
              {imgSrc ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm py-0 px-2 small d-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() =>
                    setZoomData({
                      title,
                      url: imgSrc,
                      date: current.date,
                    })
                  }
                >
                  🔍 Zoom
                </button>
              ) : (
                <span className="badge bg-light text-muted border small">Belum ada foto</span>
              )}
            </div>

            {/* Photo Container with Navigation Arrows */}
            <div
              className="position-relative d-flex align-items-center justify-content-center bg-light rounded border overflow-hidden"
              style={{ height: '170px', cursor: 'pointer' }}
              onClick={() => !imgSrc && inputRef.current?.click()}
              title="Klik untuk memilih foto dari laptop atau galeri HP"
            >
              {isUp ? (
                <div className="text-center text-primary">
                  <div className="spinner-border spinner-border-sm mb-1" role="status" />
                  <div className="small fw-semibold">Mengunggah ke RustFS...</div>
                </div>
              ) : imgSrc ? (
                <>
                  <img
                    src={imgSrc}
                    alt={title}
                    className="w-100 h-100 object-fit-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect fill='%23f1f5f9' width='300' height='200'/><text fill='%2364748b' font-family='sans-serif' font-size='14' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'>Foto Belum Tersedia</text></svg>";
                    }}
                  />

                  {/* Previous Arrow */}
                  {hasMultiple && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm position-absolute start-0 ms-1 rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                      style={{ width: '28px', height: '28px', opacity: 0.9 }}
                      disabled={activeIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdx((prev) => Math.max(0, prev - 1));
                      }}
                      title="Foto Sebelumnya"
                    >
                      ‹
                    </button>
                  )}

                  {/* Next Arrow */}
                  {hasMultiple && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm position-absolute end-0 me-1 rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                      style={{ width: '28px', height: '28px', opacity: 0.9 }}
                      disabled={activeIdx === list.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdx((prev) => Math.min(list.length - 1, prev + 1));
                      }}
                      title="Foto Berikutnya"
                    >
                      ›
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center text-muted p-3">
                  <div style={{ fontSize: '2rem' }}>📷</div>
                  <small className="d-block mt-1">Belum ada foto tersimpan</small>
                  <small className="text-primary fw-semibold" style={{ fontSize: '0.72rem' }}>
                    + Klik untuk unggah
                  </small>
                </div>
              )}
            </div>

            {/* Indicator Dots if multiple photos */}
            {hasMultiple && (
              <div className="d-flex justify-content-center gap-1 mt-2">
                {list.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: i === activeIdx ? '#0d6efd' : '#cbd5e1',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Bottom Button: Tambah Foto Baru (Update) */}
            <div className="mt-2">
              <input
                type="file"
                ref={inputRef}
                className="d-none"
                accept="image/*"
                onChange={(e) => handleUploadFile(e, category)}
              />
              <button
                type="button"
                className="btn btn-dark w-100 btn-sm py-1 d-flex align-items-center justify-content-center gap-1 text-nowrap"
                style={{ fontSize: '0.78rem' }}
                onClick={() => inputRef.current?.click()}
                disabled={isUp}
              >
                <span>📷</span> Tambah Foto Baru (Update)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 rounded-4">
            {/* Modal Header */}
            <div className="modal-header border-bottom py-3 px-4 bg-white rounded-top-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <span>🚗</span> Lampiran Kendaraan
                </h5>
                <small className="text-muted">
                  {item.NAMA_BARANG || 'Kendaraan'} — <strong>{item.NO_POLISI || '-'}</strong> ({item.NAMA || '-'})
                </small>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Modal Body */}
            <div className="modal-body p-4 bg-light">
              {/* Info Alert Box */}
              <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2 small rounded-3 border-info border-opacity-25 bg-info bg-opacity-10 text-primary">
                <span>ℹ️</span>
                <span>Klik atau Tap pada area kotak di bawah ini untuk mengunggah / mengganti foto dari laptop atau galeri HP.</span>
              </div>

              {/* 3 Photo Cards Row */}
              <div className="row g-3">
                {renderPhotoCard('Foto STNK', stnkList, stnkIdx, setStnkIdx, 'stnk', stnkInputRef)}
                {renderPhotoCard('Foto Pajak', pajakList, pajakIdx, setPajakIdx, 'pajak', pajakInputRef)}
                {renderPhotoCard('Foto Kendaraan', kendaraanList, kendaraanIdx, setKendaraanIdx, 'kendaraan', kendaraanInputRef)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top py-3 px-4 bg-white rounded-bottom-4 d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 fw-semibold"
                onClick={onClose}
                disabled={saving}
              >
                Batal / Tutup
              </button>
              <button
                type="button"
                className="btn btn-success px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{ backgroundColor: '#00b894', borderColor: '#00b894' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Menyimpan ke RustFS...</span>
                  </>
                ) : (
                  <>
                    <span>☁️</span> Simpan Lampiran
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Preview Modal */}
      {zoomData && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1065 }}
          tabIndex="-1"
          onClick={() => setZoomData(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0 text-white">
              <div className="d-flex justify-content-between align-items-center pb-2 px-2">
                <h6 className="mb-0 fw-bold">
                  {zoomData.title} <span className="small opacity-75 font-monospace">({zoomData.date})</span>
                </h6>
                <div className="d-flex gap-2">
                  <a
                    href={zoomData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-light py-0 px-2"
                  >
                    Buka Tab Baru ↗
                  </a>
                  <button
                    type="button"
                    className="btn btn-sm btn-light py-0 px-2"
                    onClick={() => setZoomData(null)}
                  >
                    ✕ Tutup
                  </button>
                </div>
              </div>
              <div className="modal-body text-center p-2">
                <img
                  src={zoomData.url}
                  alt={zoomData.title}
                  className="img-fluid rounded shadow-lg"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
