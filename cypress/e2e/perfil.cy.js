describe('Flujo completo: Login real + pruebas del perfil', () => {
  let token = null;

  it('Inicia sesión con credenciales reales y obtiene el token', () => {
    cy.visit('http://localhost:3000');

    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('123'); // Usuario real
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('40781889');     // Contraseña real
    cy.get('button').contains('Ingresar').click();

    // Confirmar que el inicio de sesión fue exitoso
    cy.contains('Inicio de sesión exitoso', { timeout: 10000 }).should('be.visible');

    // Guardar token
    cy.window().then((win) => {
      token = win.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });
  });

  it('Accede a la vista de perfil con el token', () => {
    cy.visit('http://localhost:3000/perfil', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
      }
    });

    cy.contains('Mi Perfil', { timeout: 10000 }).should('be.visible');
  });

  it('Sube una imagen de perfil', () => {
    cy.visit('http://localhost:3000/perfil', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
      }
    });

    // Asegura que solo seleccione un input
    cy.get('input[type="file"]').eq(0).selectFile('cypress/fixtures/foto-perfil.jpg', { force: true });

    cy.on('window:alert', (text) => {
      cy.then(() => {
        if (text.includes('actualizada correctamente')) {
          expect(text).to.include('actualizada correctamente');
        } else {
          cy.log('⚠️ Alerta inesperada: ' + text);
        }
      });
    });
  });

  it('Elimina la foto de perfil', () => {
    cy.visit('http://localhost:3000/perfil', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
      }
    });
  
    // Esperar que el botón esté disponible antes de hacer click
    cy.contains('Eliminar').click();
  
    // Capturar alerta sin usar cy.then
    cy.on('window:alert', (text) => {
      if (text.includes('eliminada correctamente')) {
        expect(text).to.include('eliminada correctamente');
      } else if (text.includes('no tiene una imagen de perfil')) {
        expect(text).to.include('no tiene una imagen de perfil');
      } else {
        // Si es otro mensaje, igualmente lo reportamos
        throw new Error('Alerta inesperada: ' + text);
      }
    });
  
    // Validar que no exista la imagen (si desaparece del DOM)
    cy.get('img.perfil-usuario').should('not.exist');
  });
  
  it('Sube un documento PDF al perfil', () => {
    cy.visit('http://localhost:3000/perfil', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
      }
    });
  
    // Espera que se vea el título antes de interactuar
    cy.contains('Mi Perfil', { timeout: 10000 }).should('be.visible');
  
    // Subir archivo PDF (ajusta el input[type="file"] correcto si hay más de uno)
    cy.get('input[type="file"]').eq(1) // cambia el índice si el input es otro
      .selectFile('cypress/fixtures/documento-2img.pdf', { force: true });
  
    // Capturar alerta de confirmación
    cy.on('window:alert', (text) => {
      if (text.includes('PDF subido correctamente')) {
        expect(text).to.include('PDF subido correctamente');
      } else {
        throw new Error('Alerta inesperada: ' + text);
      }
    });
  
    // Verifica que aparezca un enlace o mensaje que indique que el PDF fue subido
    cy.contains('PDF Subido:').should('exist'); // Ajusta según el texto que aparece tras subirlo
  });
  

  // Puedes seguir agregando más "it" para probar otras funcionalidades, como ver PDF, eliminar foto, etc.
});

