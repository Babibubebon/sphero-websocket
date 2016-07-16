module.exports = {
  wsPort: 8080,
  allowedOrigin: "*",
  sphero: [
    {name: "Miku", port: "/dev/rfcomm0"},
    {name: "Rin", port: "/dev/rfcomm1"}
  ]
};
