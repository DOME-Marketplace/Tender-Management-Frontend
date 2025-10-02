export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/quoteManagement',
  productApiUrl: 'https://an-dhub-sbx.dome-project.eu/tmf-api/productCatalogManagement/v4/productOffering',
  providerApiUrl: 'https://an-dhub-sbx.dome-project.eu/tmf-api/party/v4/organization',

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
