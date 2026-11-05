// AI-assisted: see docs/AI_LOG.md #[9]

const data = new FormData();

data.append('file', { 
  uri: 'file:///data/user/0/com.tuapp/cache/foto_placa.jpg', 
  type: 'image/jpeg', 
  name: 'foto.jpg' 
});

data.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
data.append('cloud_name', process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);

fetch(`https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
  method: 'POST',
  body: data,
})
.then(respuesta => respuesta.json())
.then(resultado => {
  console.log("URL lista para guardar en Firebase:", resultado.secure_url);
});