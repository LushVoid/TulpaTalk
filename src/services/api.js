function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Data fetched from API");
    }, 1000);
  });
}

export default {
  fetchData,
};
