import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClipLoader from "react-spinners/ClipLoader";
import { BiSolidCopy } from "react-icons/bi";
import copy from "copy-to-clipboard";
import { concatLandmark, percentile } from "./utils/landmark";

type Props = {};

const Address = (props: Props) => {
  const [address, setAddress] = useState("");
  const [landmarkData, setLandmarkData] = useState([]);
  const [displayKeys, setDisplayKeys] = useState({
    displayAddressOnValidation: true,
    finalValidate: false,
  });
  const [loading, setLoading] = useState(false);
  const [displayLandmark, setDisplayLandmark] = useState(false);
  const [landmarkValue, setLandmarkValue] = useState("");
  const [finalAddress, setFinalAddress] = useState("");
  const [score, setScore] = useState<any>([]);

  const copyToClipboard = (e: any) => {
    e.preventDefault();

    copy(finalAddress);

    toast.success(`Successfully copied  to Clipboard`);
  };

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setDisplayLandmark(false);
    setDisplayKeys({ ...displayKeys, finalValidate: false });

    const url = "http://65.2.176.43:8004/api/v1/landmark/nearByLandmark";
    const data = address;
    const token = "6481876edafb412cf0294413";

    const response = await axios.post(
      url,
      { address: data },
      { headers: { Authorization: token } }
    );

    if (response.data.success === 1) {
      setLoading(false);
      setDisplayLandmark(true);

      toast.success("Landmark data fetched successfully.");
      setLandmarkData(response?.data?.data);
      const onlyRatings: any = [];
      response?.data?.data?.forEach((ele: any) => {
        onlyRatings.push(ele.user_ratings_total);
      });

      setScore(percentile(onlyRatings));
    } else {
      setLoading(false);
      setDisplayLandmark(false);
      toast.error("Landmark data not found.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[100vh] p-[30px]">
      <img
        src="./shipyaari.png"
        alt="Shipyaari"
        width="120px"
        height="30px"
        className="mb-4"
      />

      {displayKeys.displayAddressOnValidation && (
        <form
          onSubmit={onFormSubmit}
          className="flex flex-col shadow-lg  border-2 border-grey rounded-lg p-[40px] mb-[30px]"
        >
          <div className="flex items-center mb-[50px]">
            <label htmlFor="message" className="mr-4">
              Address:
            </label>
            <textarea
              name="address"
              value={address}
              rows={4}
              cols={40}
              placeholder="Enter the address"
              className="border-2 border-slate-300 rounded-lg"
              onChange={(e) => {
                setAddress(e.target.value);
              }}
              required
            ></textarea>
          </div>
          <div className="flex justify-center   items-center mb-[40px]">
            <button
              type="submit"
              className="border-2 border-slate-300 rounded-lg h-[40px] bg-[#3490dc] text-white w-[120px]"
            >
              Search
            </button>
          </div>
          {displayLandmark && (
            <div className="flex flex-col items-center max-h-[400px] border-2 border-slate-300 shadow-lg rounded-lg overflow-y-auto">
              <p className="mb-5 text-[20px] italic font-medium">
                Select the landmark
              </p>
              <div className="flex flex-row  w-[100%]  mb-[10px]">
                <p className="mr-[125px] ml-[180px] font-medium">Landmark</p>
                <p className="font-medium">Score</p>
              </div>
              {landmarkData?.map((each: any, index) => {
                if (index <= 9) {
                  return (
                    <div className="flex flex-row mb-3" key={index}>
                      <input
                        type="radio"
                        name="landmark"
                        value={each.name}
                        onChange={async (e) => {
                          setLandmarkValue(e.target.value);

                          const concatAddress = await concatLandmark(
                            address,
                            e.target.value
                          );
                          console.log("concate address ", concatAddress);

                          setFinalAddress(concatAddress || "");

                          setDisplayKeys({
                            ...displayKeys,
                            finalValidate: true,
                          });
                        }}
                        className="mr-5 h-[50px] p-3"
                      />
                      <input
                        type="text"
                        value={each.name}
                        className="border-2 border-slate-300 rounded-lg mr-3 h-[50px] p-3"
                        readOnly
                      />
                      <input
                        type="text"
                        className="text-center border-2 border-slate-300 rounded-lg w-[80px] h-[50px]"
                        value={score[index]}
                      />
                    </div>
                  );
                }
                return <></>;
              })}
            </div>
          )}
          {loading && (
            <p className="flex justify-center items-center">Loading...</p>
          )}
          {displayKeys.finalValidate && (
            <div className="flex flex-col items-center mb-[20px] mt-[30px]">
              <p className="mb-[10px] text-[20px] italic font-semibold">
                Address with landmark
              </p>
              <div className="flex flex-col shadow-lg  border-2 border-grey rounded-lg p-[40px]">
                <div className="flex flex-row justify-center items-center">
                  <textarea
                    rows={4}
                    cols={30}
                    value={finalAddress}
                    name="finalAddress"
                    className="border-2 border-slate-300 rounded-lg mr-4"
                  ></textarea>

                  <button onClick={copyToClipboard}>
                    <BiSolidCopy />
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      <ToastContainer />
      <ClipLoader
        loading={loading}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Address;
