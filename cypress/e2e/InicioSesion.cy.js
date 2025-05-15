describe('Prueba inicio Sesion - Usuario Comun', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Asegúrate de que tu frontend esté corriendo
  });

  it('Muestra error si los campos están vacíos', () => {
    cy.get('button').contains('Ingresar').click();
    cy.contains('Ingrese todos los datos').should('be.visible');
  });

  it('Muestra mensaje de error si las credenciales fallan', () => {
    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('121212');
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('claveIncorrecta');
    cy.get('button').contains('Ingresar').click();

    cy.contains('Credenciales no existentes o incorrectas', { timeout: 5000 }).should('be.visible');
  });

  it('Muestra mensaje de error si la identificacion no es un numero', () => {
    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('usuario no existente');
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('claveIncorrecta');
    cy.get('button').contains('Ingresar').click();

    
    cy.contains('El ID debe ser un número', { timeout: 5000 }).should('be.visible');
  });

  it('Permite ingresar con datos válidos', () => {
    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('123'); // Usa un usuario real
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('40781889');     // Usa una contraseña válida
    cy.get('button').contains('Ingresar').click();

    // Espera que aparezca el mensaje real antes de la redirección
    cy.contains('Inicio de sesión exitoso', { timeout: 10000 }).should('be.visible');
  });
});

describe('Prueba inicio Sesion - Usuario Admin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Asegúrate de que tu frontend esté corriendo
  });

  it('Muestra error si los campos están vacíos', () => {
    cy.get('button').contains('Ingresar').click();
    cy.contains('Ingrese todos los datos').should('be.visible');
  });

  it('Muestra mensaje de error si las credenciales fallan', () => {
    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('121212');
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('claveIncorrecta');
    cy.get('button').contains('Ingresar').click();

    cy.contains('Credenciales no existentes o incorrectas', { timeout: 5000 }).should('be.visible');
  });

  it('Muestra mensaje de error si la identificacion no es un numero', () => {
    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('usuario no existente');
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('claveIncorrecta');
    cy.get('button').contains('Ingresar').click();

    
    cy.contains('El ID debe ser un número', { timeout: 5000 }).should('be.visible');
  });

  it('Permite ingresar con datos válidos de admin a panel de admin', () => {
    cy.get('input[placeholder="Ingrese Su Número De Documento"]').type('1118366640'); // usuario admin real
    cy.get('input[placeholder="Ingrese Su Contraseña"]').type('40781889');     //contrasena admin real
    cy.get('button').contains('Ingresar').click();

    // Espera que aparezca el mensaje real antes de la redirección
    cy.contains('Inicio de sesión exitoso', { timeout: 10000 }).should('be.visible');
    cy.contains('Descargar base de datos', { timeout: 10000 }).should('be.visible');
  });
});







