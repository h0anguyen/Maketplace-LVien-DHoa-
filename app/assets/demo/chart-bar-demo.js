// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily =
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#292b2c";

// Bar Chart Example
var ctx = document.getElementById("myBarChart").getContext("2d");
var myLineChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Năm 2023",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "blue",
        fill: false,
      },
      {
        label: "Năm 2024",
        data: [22, 31, 5, 8, 4, 6],
        backgroundColor: "red",
        fill: false,
      },
    ],
  },
});
