// ============================================================
// LampiranKendaraanModal.jsx — Modal Lampiran Foto Kendaraan
// Terintegrasi dengan RustFS Storage & Riwayat Tanggal Foto
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { uploadFileToRustFS } from '../../services/storageService';

/**
 * Helper untuk memastikan URL foto dapat dimuat langsung oleh browser via Serverless Proxy
 */
function getValidImageSrc(url, fileKey) {
  if (!url && !fileKey) return null;
  if (url && url.startsWith('data:')) return url;
  if (url && url.startsWith('blob:')) return null; // Abaikan blob URL kadaluarsa

  let key = fileKey;
  if (!key && url && url.includes('/si-aset/')) {
    key = decodeURIComponent(url.split('/si-aset/')[1]);
  }
  if (!key && url && url.includes('key=')) {
    key = decodeURIComponent(url.split('key=')[1].split('&')[0]);
  }

  if (key) {
    return `/api/storage?key=${encodeURIComponent(key)}`;
  }

  if (url && url.startsWith('http') && !url.includes('drive.google.com')) {
    return url;
  }

  return null;
}

/**
 * Helper untuk mem-parsing data foto dari Firebase/CSV ke format array [{ url, date }]
 */
function parsePhotoList(raw) {
  if (!raw) return [];
  let parsed = [];

  if (Array.isArray(raw)) {
    parsed = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const cleaned = trimmed.replace(/\\"/g, '"');
        const p = JSON.parse(cleaned);
        parsed = Array.isArray(p) ? p : [p];
      } catch (e) {
        // fallback
      }
    } else if (trimmed.startsWith('http') || trimmed.startsWith('/api/storage')) {
      parsed = [{ url: trimmed, date: 'Foto Awal' }];
    }
  }

  return parsed
    .map((item) => {
      if (typeof item === 'string') {
        const src = getValidImageSrc(item);
        if (!src && item.startsWith('blob:')) return null;
        return { url: src, originalUrl: item, date: 'Foto Awal' };
      }
      const rawUrl = item.url || item.publicUrl || item.downloadUrl || '';
      const src = getValidImageSrc(rawUrl, item.fileKey);
      return {
        ...item,
        url: src || rawUrl,
        fileKey: item.fileKey || (rawUrl.includes('/si-aset/') ? decodeURIComponent(rawUrl.split('/si-aset/')[1]) : null),
        originalUrl: rawUrl,
        date: item.date || 'Tersimpan',
      };
    })
    .filter(Boolean);
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zoomData, setZoomData] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomRotation, setZoomRotation] = useState(0);

  const stnkInputRef = useRef(null);
  const pajakInputRef = useRef(null);
  const kendaraanInputRef = useRef(null);

  // Ambil data foto langsung dari RustFS Storage (Single Source of Truth)
  const fetchPhotosFromRustFS = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_vehicle_photos',
          nopol: item.NO_POLISI || '',
          vehicleId: item.id || '',
        }),
      });
      const data = await res.json();
      if (data.success && data.photos) {
        const stnk = data.photos.stnk || [];
        const pajak = data.photos.pajak || [];
        const kdrn = data.photos.kendaraan || [];

        setStnkList(stnk);
        setPajakList(pajak);
        setKendaraanList(kdrn);

        setStnkIdx(Math.max(0, stnk.length - 1));
        setPajakIdx(Math.max(0, pajak.length - 1));
        setKendaraanIdx(Math.max(0, kdrn.length - 1));
      } else {
        setStnkList([]);
        setPajakList([]);
        setKendaraanList([]);
      }
    } catch (err) {
      console.warn('Gagal memuat foto dari RustFS:', err);
      setStnkList([]);
      setPajakList([]);
      setKendaraanList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (item && show) {
      fetchPhotosFromRustFS();
    } else {
      setStnkList([]);
      setPajakList([]);
      setKendaraanList([]);
    }
  }, [item, show]);

  if (!show || !item) return null;

  const cleanTag = (item.NO_POLISI || item.id || 'KDRN').replace(/[^a-zA-Z0-9]/g, '_');

  // Handle Upload Foto langsung ke RustFS
  const handleUploadFile = async (e, category) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let subFolder = 'FOTO KENDARAAN';
    if (category === 'stnk') subFolder = 'FOTO STNK';
    if (category === 'pajak') subFolder = 'FOTO PAJAK';

    const folder = `KENDARAAN/${cleanTag}/LAMPIRAN FOTO/${subFolder}`;

    setUploading((prev) => ({ ...prev, [category]: true }));

    try {
      await uploadFileToRustFS(file, folder);
      // Refresh daftar foto langsung dari RustFS
      await fetchPhotosFromRustFS();
    } catch (err) {
      alert(`Gagal mengunggah foto ke RustFS: ${err.message}`);
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
      e.target.value = ''; // reset file input
    }
  };

  // Simpan / Tutup Lampiran
  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave({
          ...item,
          FOTO_STNK: null,
          FOTO_PAJAK: null,
          FOTO_KENDARAAN: null,
          LAMPIRAN_UPDATED_AT: new Date().toISOString(),
        });
      }
      onClose();
    } catch (err) {
      alert(`Pemberitahuan: ${err.message}`);
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
              {imgSrc ? (
                <>
                  <span className="badge bg-dark bg-opacity-75 text-white fw-normal font-monospace small">
                    🕒 {current?.date}
                  </span>
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
                </>
              ) : (
                <div className="w-100 text-center">
                  <span className="badge bg-light text-muted border small">Belum ada riwayat foto</span>
                </div>
              )}
            </div>

            {/* Photo Container with Navigation Arrows */}
            <div
              className="position-relative d-flex align-items-center justify-content-center bg-light rounded border overflow-hidden"
              style={{ height: '170px', cursor: 'pointer' }}
              onClick={() => !imgSrc && inputRef.current?.click()}
              title="Klik untuk memilih foto dari laptop atau galeri HP"
            >
              {loading ? (
                <div className="text-center text-secondary">
                  <div className="spinner-border spinner-border-sm mb-1" role="status" />
                  <div className="small fw-semibold" style={{ fontSize: '0.75rem' }}>Memuat dari RustFS...</div>
                </div>
              ) : isUp ? (
                <div className="text-center text-primary">
                  <div className="spinner-border spinner-border-sm mb-1" role="status" />
                  <div className="small fw-semibold" style={{ fontSize: '0.75rem' }}>Mengunggah ke RustFS...</div>
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
                <div className="text-center text-muted p-2">
                  <div className="fs-3 mb-1">📷</div>
                  <div className="fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>Belum ada foto</div>
                  <div className="text-primary mt-1 fw-bold" style={{ fontSize: '0.72rem' }}>
                    + Klik untuk unggah baru
                  </div>
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

      {/* Lightbox / Enhanced Zoom Preview Modal with Zoom In, Zoom Out & Rotation */}
      {zoomData && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 1065 }}
          tabIndex="-1"
          onClick={() => {
            setZoomData(null);
            setZoomScale(1);
            setZoomRotation(0);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            style={{ maxWidth: '92vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0 text-white">
              {/* Header with Title & Zoom Controls Toolbar */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 px-2 border-bottom border-secondary border-opacity-50">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0 fw-bold fs-6">
                    {zoomData.title}
                  </h6>
                  <span className="badge bg-secondary bg-opacity-75 text-white font-monospace small">
                    🕒 {zoomData.date}
                  </span>
                </div>

                {/* Toolbar: Zoom In, Zoom Out, Rotate, Reset, Close */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="btn-group btn-group-sm bg-dark rounded shadow border border-secondary" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-light px-2 d-flex align-items-center gap-1"
                      onClick={() => setZoomScale((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                      disabled={zoomScale <= 0.5}
                      title="Perkecil Gambar (Zoom Out)"
                    >
                      <span>➖</span> Zoom Out
                    </button>
                    <span className="btn btn-dark disabled text-white fw-bold px-2 font-monospace" style={{ minWidth: '60px' }}>
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-light px-2 d-flex align-items-center gap-1"
                      onClick={() => setZoomScale((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))))}
                      disabled={zoomScale >= 3.5}
                      title="Perbesar Gambar (Zoom In)"
                    >
                      <span>➕</span> Zoom In
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 shadow-sm px-2"
                    onClick={() => setZoomRotation((prev) => (prev + 90) % 360)}
                    title="Putar Gambar 90 Derajat"
                  >
                    <span>🔄</span> Putar
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary text-white d-flex align-items-center gap-1 shadow-sm px-2"
                    onClick={() => {
                      setZoomScale(1);
                      setZoomRotation(0);
                    }}
                    title="Kembalikan ke Ukuran Semula"
                  >
                    <span>↺</span> Reset
                  </button>

                  <a
                    href={zoomData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-info text-white d-flex align-items-center gap-1 shadow-sm px-3"
                    title="Buka Gambar Asli di Tab Baru"
                  >
                    <span>↗</span> Buka Tab Baru
                  </a>

                  <button
                    type="button"
                    className="btn btn-sm btn-danger px-3 shadow-sm fw-bold"
                    onClick={() => {
                      setZoomData(null);
                      setZoomScale(1);
                      setZoomRotation(0);
                    }}
                  >
                    ✕ Tutup
                  </button>
                </div>
              </div>

              {/* Zoom Image Area */}
              <div
                className="modal-body text-center p-3 d-flex align-items-center justify-content-center overflow-auto"
                style={{
                  minHeight: '65vh',
                  maxHeight: '80vh',
                  cursor: zoomScale > 1 ? 'grab' : 'default',
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoomScale}) rotate(${zoomRotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'inline-block',
                  }}
                >
                  <img
                    src={zoomData.url}
                    alt={zoomData.title}
                    className="img-fluid rounded shadow-lg border border-secondary border-opacity-50"
                    style={{
                      maxHeight: '75vh',
                      maxWidth: '85vw',
                      objectFit: 'contain',
                      pointerEvents: 'auto',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
