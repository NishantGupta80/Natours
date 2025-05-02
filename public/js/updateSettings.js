import { showAlert } from "./alert";
import axios from "axios";

// type --> 'data' or 'Password'
export const updateData = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updatePassword"
        : "/api/v1/users/updateMe";

        console.log("url -->",url)
    const res = await axios({
      method: "PATCH",
      url,
      data
    });
    console.log(res);
    if (res.data.status === "success") console.log("Success");
    showAlert("success", `${type.toUpperCase()} Updated Successfully`);
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
