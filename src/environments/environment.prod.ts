export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/quoteManagement',
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