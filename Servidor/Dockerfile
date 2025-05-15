# Usar una imagen base oficial de Node.js
FROM node:16

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos necesarios para instalar dependencias
COPY package.json package-lock.json /app/

# Instalar las dependencias del proyecto
RUN npm install

# Copia la carpeta de certificados al contenedor
COPY ./certs /app/certs  


# Copiar el resto del código, incluyendo la carpeta 'Servidor'
COPY . .

# Exponer el puerto en el que el backend escuchará
EXPOSE 3001

# Comando para arrancar la aplicación
CMD ["node", "Servidor/server.js"]

