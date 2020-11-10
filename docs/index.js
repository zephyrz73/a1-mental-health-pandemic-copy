d3 = require('d3@6')
d3.csv('data.csv').then(function(data){
  console.log(data[0]);
});
