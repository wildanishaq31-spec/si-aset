// ============================================================
// templateService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'TemplateDokumen';

export async function getTemplates() {
  const q = query(ref(db, COL), orderByChild('jenis_aset'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data;
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
