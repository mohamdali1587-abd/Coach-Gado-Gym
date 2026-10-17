const params = new URLSearchParams(location.search)
const errorBox = document.querySelector('#error')
errorBox.textContent = params.get('error') || ''
document.querySelector('#connect-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  errorBox.textContent = ''
  const result = await window.coachGadoDesktop.connect(document.querySelector('#server').value)
  if (!result.ok) errorBox.textContent = result.error
})
