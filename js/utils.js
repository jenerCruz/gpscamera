export function showMessage(text, isError = false) {
  const box = document.getElementById('message-box');
  box.textContent = text;
  box.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 p-3 text-white rounded-lg shadow-xl ${isError ? 'bg-red-600' : 'bg-green-600'}`;
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 4000);
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
