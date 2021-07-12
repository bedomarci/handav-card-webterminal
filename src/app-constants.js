const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://handav.hu/api/'
    : 'http://localhost:8010/proxy/'
const API_TOKEN_AUTH_URL = API_URL + 'Operational/v1/token/auth'
const API_TOKEN_URL = API_URL + 'Operational/v1/token/' 
const API_CARD_CREATE_URL = API_URL + 'Operational/v1/cards/' 
const API_CARD_CREDIT_URL = API_URL + 'Operational/v1/cards/{CardUniqueIdentifier}/credit/add?CardCredit={value}&CreditChangeRemarks=HandavTerminal' 
const API_CARD_REVALUE_URL = API_URL + 'Operational/v1/cards/{CardUniqueIdentifier}/revalue/add?CardCredit={value}&CreditChangeRemarks=HandavTerminal' 
const API_CARD_STATUS_URL = API_URL + 'Operational/v1/cards/{CardUniqueIdentifier}/status/{CardStatus}'
const API_CARD_UPDATE_URL = API_URL + 'Operational/v1/cards/{CardId}/prepaid'
const API_CARD_GROUPS_URL = API_URL + 'Operational/v1/cards/{CardId}/cardGroups'
const API_FETCH_CONFIG_URL = './config/'

// const API_CARD_CREATE_URL = API_URL + '/Operational/v2/cards/' 



export default {
  API_URL: API_URL,
  API_TOKEN_AUTH_URL: API_TOKEN_AUTH_URL,
  API_TOKEN_URL: API_TOKEN_URL,
  API_CARD_CREATE_URL:API_CARD_CREATE_URL,
  API_CARD_CREDIT_URL:API_CARD_CREDIT_URL,
  API_CARD_REVALUE_URL:API_CARD_REVALUE_URL,
  API_CARD_STATUS_URL:API_CARD_STATUS_URL,
  API_FETCH_CONFIG_URL:API_FETCH_CONFIG_URL,
  API_CARD_UPDATE_URL:API_CARD_UPDATE_URL,
  API_CARD_GROUPS_URL:API_CARD_GROUPS_URL,
}
