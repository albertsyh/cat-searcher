import axios from "axios";

const wordsApi = axios.create({
  baseURL: "https://api.datamuse.com/",
});

export { wordsApi };

export default axios.create({
  baseURL: "https://cataas.com",
});
