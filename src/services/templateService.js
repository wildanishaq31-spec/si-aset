// ============================================================
// templateService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'TemplateDokumen';

export async function getTemplates() {
  try {
    const snap = await get(ref(db, COL));
    const data = [];
    if (snap.exists()) {
      const val = snap.val();
      if (Array.isArray(val)) {
        val.forEach((item, idx) => { if (item) data.push({ id: String(item.id || idx), ...item }); });
      } else if (typeof val === 'object' && val !== null) {
        Object.entries(val).forEach(([key, item]) => {
          if (item && typeof item === 'object') data.push({ id: String(item.id || key), ...item });
        });
      }
    }
    return data;
  } catch (err) {
    console.error('getTemplates error:', err);
    return [];
  }
}

export async function saveTemplate(id, isiTemplate) {
  await update(ref(db, `${COL}/${id}`), {
    isi_template: isiTemplate,
    updated_at: serverTimestamp(),
  });
  return { id, success: true };
}

export async function addNewTemplate(jenisAset, jenisTemplate, namaTemplate, isiTemplate = '') {
  const newId = `T-${Date.now()}`;
  await set(ref(db, `${COL}/${newId}`), {
    id: newId,
    jenis_aset: jenisAset,
    jenis_template: jenisTemplate,
    nama_template: namaTemplate,
    isi_template: isiTemplate,
    status: 'Aktif',
    created_at: serverTimestamp(),
  });
  return { id: newId, success: true };
}

export async function deleteTemplate(id) {
  await remove(ref(db, `${COL}/${id}`));
  return { success: true };
}

export async function getTemplatesByAset(jenisAset) {
  const all = await getTemplates();
  return all.filter((t) => t.jenis_aset === jenisAset && t.status === 'Aktif');
}
