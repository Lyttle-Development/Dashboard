import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import React, { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";

export function Page() {
  const [data, setData] = useState({
    firstName: "Kilian",
    lastName: "De Bock",
    position: "Founder",
    telephone: "+32470216421",
    addressLine1: "Damstraat 65,",
    addressLine2: "9180 Lokeren, België",
    image: "",
    logo: "",
  });

  // Fetch the logo data URL when the component mounts
  useEffect(() => {
    fetch("/logo/email.png")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Once converted, store the logo data URL in state
          setData((prev) => ({
            ...prev,
            logo: reader.result as string,
          }));
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.error("Error fetching the logo:", error);
      });
  }, []);

  const signatureRef = React.createRef<HTMLDivElement>();

  const set = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const selectSignature = () => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(signatureRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const formatTelephone = (telephone: string): string => {
    // Verwijder spaties of speciale tekens voor een zuivere invoer
    const cleanNumber = telephone.replace(/\D/g, "");

    // Belgisch mobiel nummer: 04XX XX XX XX of +32 4XX XX XX XX
    if (/^04\d{8}$/.test(cleanNumber)) {
      return `${cleanNumber.slice(0, 4)} ${cleanNumber.slice(4, 6)} ${cleanNumber.slice(6, 8)} ${cleanNumber.slice(8, 10)}`;
    }
    if (/^324\d{8}$/.test(cleanNumber)) {
      return `+32 ${cleanNumber.slice(2, 5)} ${cleanNumber.slice(5, 7)} ${cleanNumber.slice(7, 9)} ${cleanNumber.slice(9, 11)}`;
    }

    // Belgisch vast nummer: 02 X XX XX XX, 03 XXX XX XX, 09 XXX XX XX, enz.
    if (/^0[1-9]\d{7,8}$/.test(cleanNumber)) {
      if (cleanNumber.startsWith("02")) {
        // Brussel: 02 X XX XX XX
        return `${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 3)} ${cleanNumber.slice(3, 5)} ${cleanNumber.slice(5, 7)} ${cleanNumber.slice(7)}`;
      } else {
        // Andere regio's: 03 XXX XX XX, 09 XXX XX XX, enz.
        return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6, 8)} ${cleanNumber.slice(8)}`;
      }
    }
    if (/^32[1-9]\d{7,8}$/.test(cleanNumber)) {
      if (cleanNumber.startsWith("322")) {
        return `+32 ${cleanNumber.slice(2, 4)} ${cleanNumber.slice(4, 5)} ${cleanNumber.slice(5, 7)} ${cleanNumber.slice(7, 9)} ${cleanNumber.slice(9)}`;
      } else {
        return `+32 ${cleanNumber.slice(2, 5)} ${cleanNumber.slice(5, 8)} ${cleanNumber.slice(8, 10)} ${cleanNumber.slice(10)}`;
      }
    }
    return telephone;
  };

  const getBinary = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;

      // Create an Image element to load the file data
      const imgElement = new Image();
      imgElement.onload = () => {
        // Set desired canvas dimensions
        const canvasWidth = 92;
        const canvasHeight = 110;
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Use canvas filter to convert the image to greyscale
          ctx.filter = "grayscale(100%)";

          // Calculate scale for "object-fit: cover"
          const scale = Math.max(
            canvasWidth / imgElement.width,
            canvasHeight / imgElement.height,
          );
          const newWidth = imgElement.width * scale;
          const newHeight = imgElement.height * scale;
          const offsetX = (canvasWidth - newWidth) / 2;
          const offsetY = (canvasHeight - newHeight) / 2;

          // Draw the image with computed dimensions and offsets
          ctx.drawImage(imgElement, offsetX, offsetY, newWidth, newHeight);

          // Convert the canvas back to a data URL
          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              set("image", reader.result as string);
            };
            reader.readAsDataURL(blob);
          });
        }
      };

      imgElement.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  return (
    <Container>
      <h1>Create Signature</h1>
      <article>
        <Field
          label="First Name"
          required
          onChange={(e) => set("firstName", e)}
          value={data.firstName}
        />
        <Field
          label="Last Name"
          required
          onChange={(e) => set("lastName", e)}
          value={data.lastName}
        />
        <Field
          label="Position"
          required
          onChange={(e) => set("position", e)}
          value={data.position}
        />
        <Field
          label="Telephone"
          required
          onChange={(e) => set("telephone", e)}
          value={data.telephone}
        />
        <Field
          label="Address Line 1"
          required
          onChange={(e) => set("addressLine1", e)}
          value={data.addressLine1}
        />
        <Field
          label="Address Line 2"
          onChange={(e) => set("addressLine2", e)}
          value={data.addressLine2}
        />
        <Field label="Image" type={FormOptionType.FILE} onFile={getBinary} />
      </article>
      <article className={styles.signature_container} onClick={selectSignature}>
        <div ref={signatureRef}>
          <p>
            Beste
            <br />
            <br />
            Text
            <br />
            <br />
            Met vriendelijke groeten / Kind regards
          </p>
          <table
            style={{
              paddingTop: "28px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    paddingRight: "41px",
                    width: "160px",
                    borderRight: "1px solid #E5E4E4",
                  }}
                >
                  <img
                    src={data.image}
                    alt="Profile Picture"
                    style={{
                      width: "92px",
                      height: "110px",
                      marginBottom: "24px",
                    }}
                  />
                  <img
                    src={data.logo}
                    alt="LyttleDevelopment Logo"
                    style={{
                      width: "120px",
                      height: "43px",
                    }}
                  />
                </td>
                <td
                  style={{
                    paddingLeft: "45px",
                  }}
                >
                  <p>
                    {data.firstName} {data.lastName}
                  </p>
                  <p>{data.position}</p>
                  <p>{formatTelephone(data.telephone)}</p>
                  <p>{data.addressLine1}</p>
                  <p>{data.addressLine2}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
