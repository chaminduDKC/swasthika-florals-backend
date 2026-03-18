export const optimizeImage = (url, width = 800) => {
    if (!url || !url.includes('cloudinary.com')) return url

    // Insert transformation after '/upload/'
    return url.replace(
        '/upload/',
        `/upload/w_${width},q_auto,f_auto/`
    )
}