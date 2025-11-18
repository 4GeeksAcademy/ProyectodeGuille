import React, { useState } from "react";
import { Box, Typography, Card, CardContent, CardMedia, Button } from "@mui/material";

export const Eventos = () => {
  const [events] = useState([
    { id: 1, name: "Yoga Matutino", description: "Sesión de yoga matutina para empezar el día.", image: "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/724c514c8455afc2a374acfef42807e12740f867305e87421a07c24d39d14a23.jpeg" },
    { id: 2, name: "Carrera Nocturna", description: "Carrera grupal en el parque para todos los niveles.", image: "https://www.aytolalaguna.es/actualidad/noticias/.galleries/IMAGENES-Noticias/2025/01/CARRERA-NOCTURNA-2024.jpeg" },
    { id: 3, name: "Pilates", description: "Relaja y fortalece tu cuerpo en la tarde.", image: "https://assets.dmagstatic.com/wp-content/uploads/2019/08/tight10of19-677x451.jpg" },
    { id: 4, name: "Spinning Intensivo", description: "Entrenamiento intenso en bicicleta.", image: "https://blogscdn.thehut.net/wp-content/uploads/sites/450/2016/08/09041209/beneficios-spinning-1.jpg" },
    { id: 5, name: "Meditación Guiada", description: "Sesión de meditación guiada para relajarte.", image: "https://www.elpradopsicologos.es/storage/posts/June2021/group-of-young-sporty-people-sitting-in-padmasana-pose.jpg" },
    { id: 6, name: "Entrenamiento Funcional", description: "Mejora fuerza y movilidad con ejercicios funcionales.", image: "https://akroscenter.com/wp-content/uploads/2023/05/Entrenamiento-funcional-Descubre-sus-beneficios.jpg" },
    { id: 7, name: "Caminata Saludable", description: "Caminata grupal al aire libre para mantenerse activo.", image: "https://estaticosgn-cdn.deia.eus/clip/604fa017-9146-4961-b436-f7bb5a2ff949_16-9-discover-aspect-ratio_default_0.jpg" },
    { id: 8, name: "Natación para Todos", description: "Sesión de natación para todos los niveles.", image: "https://noticiasncc.com/wp-content/uploads/2024/01/183-6-CIENCIA_Natacio%CC%81n-nin%CC%83os_.jpg" },
  ]);

  return (
    <Box sx={{ mt: 5, display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
      {events.map((event) => (
        <Card
          key={event.id}
          sx={{
            width: "22%", 
            minWidth: 170,
            boxShadow: "0px 0px 5px 2px #817DF9",
            borderRadius: 2,
            textAlign: "center",
            transition: "transform 0.3s",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {event.image && (
            <CardMedia
              component="img"
              height="175"
              image={event.image}
              alt={event.name}
            />
          )}
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ color: "#20232D", fontWeight: 700 }}>
                {event.name}
              </Typography>
              <Button size="small" sx={{ minWidth: "24px", bgcolor: "#EE6C4D", color: "#fff", fontWeight: "bold" }}>+</Button>
              <Button size="small" sx={{ minWidth: "24px", bgcolor: "#817DF9", color: "#fff", fontWeight: "bold" }}>🔍</Button>
            </Box>
            <Typography variant="body2" sx={{ color: "#fff", fontSize: "0.75rem" }}>
              {event.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
