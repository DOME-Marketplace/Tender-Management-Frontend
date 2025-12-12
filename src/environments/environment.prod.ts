export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/quoteManagement',
  searchOrganizationsEndpoint: 'http://dome-search-svc.search-engine.svc.cluster.local:8080/api/searchOrganizations',
  endpoints: {
    createQuote: '/createQuote',
    listAllQuotes: '/listAllQuotes',
    getQuoteById: '/quoteById',
    getQuotesByUser: '/quoteByUser',
    updateQuoteStatus: '/updateQuoteStatus',
    updateQuoteDate: '/updateQuoteDate',
    addNoteToQuote: '/addNoteToQuote',
    addAttachmentToQuote: '/addAttachmentToQuote',
    deleteQuote: '/quote'
  }
}; 
