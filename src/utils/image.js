// Reduz a foto tirada no celular antes de salvar no navegador:
// no máximo 1024 px no lado maior, em JPEG. Uma foto de 4 MB vira algo perto de 100 KB.
export function compressImage(file, maxSize = 1024, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
        reader.onload = () => {
            const img = new Image()
            img.onerror = () => reject(new Error('Arquivo de imagem inválido.'))
            img.onload = () => {
                const escala = Math.min(1, maxSize / Math.max(img.width, img.height))
                const canvas = document.createElement('canvas')
                canvas.width = Math.round(img.width * escala)
                canvas.height = Math.round(img.height * escala)
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL('image/jpeg', quality))
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    })
}
