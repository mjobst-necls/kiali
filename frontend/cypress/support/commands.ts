// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

let haveCookie = Cypress.env('cookie')

declare global {
	namespace Cypress {
		interface Chainable<Subject> {
			login(providerName?: string, username?: string, password?: string, auth_strategy?: string): Chainable<Element>;
			logout(): Chainable<Element>;
		}
	}
}

Cypress.Commands.add('login', (provider: string, username: string, password: string, auth_strategy: string) => {
	cy.log("auth cookie is:", haveCookie)

	cy.window().then((win: any) => {
		if (auth_strategy != 'openshift') {
			cy.log('Skipping login, Kiali is running with auth disabled');
		} else {
			if (haveCookie === false) {
				cy.intercept('api/authenticate').as('authorized') //request setting kiali cookie
				cy.log(
					`provider: ${provider}, 
					username: ${username},
					auth_strategy: ${auth_strategy}`)
				cy.visit('/');

				if (auth_strategy === 'openshift') {
					cy.get('.pf-c-form').contains(auth_strategy, { matchCase: false }).click()
				}

				if (auth_strategy === 'openshift') {
					cy.get('.pf-c-button').contains(provider, { matchCase: false }).click()
				}

				if (auth_strategy === 'openshift') {
					cy.get('#inputUsername').type(username);
					cy.get('#inputPassword').type(password);
					cy.get('button[type="submit"]').click()
					cy.wait('@authorized').its('response.statusCode').should('eq', 200)
					cy.getCookie('kiali-token', { timeout: 5000 }).should('exist').then((c) => {
						haveCookie = true
					})
				}
			} else {
				cy.log('got an auth cookie, skipping login')
			}
		}
	});
});

