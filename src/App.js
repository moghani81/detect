import "./App.css";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Col, Divider, message, Row, Upload } from "antd";
import React, { useState } from "react";
import axios from "axios";

function getBase64(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => callback(reader.result);
  reader.onerror = (error) => {
    console.log("Error: ", error);
  };
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";

  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }

  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }

  return isJpgOrPng && isLt2M;
};

function App() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [imageData, setImageData] = useState();

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }

    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  const handleRequest = ({ file, onSuccess, onProgress, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post("https://fastapi-kp5o7w.chabk.ir/detect/", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      .then(({ data }) => {
        const ImageFile = new File([data], "image.jpg", {
          type: "image/jpeg",
        });
        const reader = new FileReader();
        reader.readAsDataURL(ImageFile);
        reader.onload = () => {
          setImageData(reader.result);
          onSuccess(data);
        };
      })
      .catch((err) => {
        onError(err);
      });
  };

  return (
    <>
      <Divider>
        <h1>Traffic light detection project</h1>
      </Divider>
      <Row justify="center">
        <Col>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={handleRequest}
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="avatar"
                style={{
                  width: "100%",
                }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
        </Col>
      </Row>
      <Row justify="center">
        <Col span={12} style={{ background: "#000" }}>
          {imageData && (
            <img className="result" src={imageData} alt="detected" />
          )}
        </Col>
      </Row>
    </>
  );
}

export default App;
