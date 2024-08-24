// cypress/e2e/sample.spec.js
describe('Mi Primera Prueba', () => {
  it('Visita la página principal y verifica el título', () => {
    cy.visit('http://localhost:8100/login'); // Ajusta la URL si es necesario
    cy.title().should('include', 'Mi Aplicación');
  });
});
