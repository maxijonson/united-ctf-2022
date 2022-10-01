import nc from "../../../utils/nc";

nc(1337, (data) => {
  console.log(data.toString());
});
