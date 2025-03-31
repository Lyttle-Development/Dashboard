import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import React, { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { safeParseFieldString } from "@/lib/parse";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Signature" });
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    telephone: "+32",
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
  const signatureContainerRef = React.createRef<HTMLDivElement>();

  const set = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const isValid = () => {
    return (
      data.firstName &&
      data.lastName &&
      data.position &&
      data.telephone &&
      data.addressLine1
    );
  };

  const selectSignature = () => {
    if (!isValid()) {
      window.alert(
        "Please fill in all required fields before copying the signature.",
      );
      return;
    }

    if (!data.image) {
      window.alert("Please upload an image before copying the signature.");
      return;
    }

    // set "coping" class to the signature container
    signatureContainerRef.current.classList.add(styles.coping);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(signatureRef.current);
    selection.removeAllRanges();
    selection.addRange(range);

    // Make the user copy the signature
    document.execCommand("copy");

    // Notify the user
    window.alert("Signature copied to clipboard!");

    // remove "coping" class from the signature container
    signatureContainerRef.current.classList.remove(styles.coping);
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

      const imgElement = new Image();
      imgElement.onload = () => {
        const canvasSize = 121;
        const canvas = document.createElement("canvas");
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.clearRect(0, 0, canvasSize, canvasSize);

          // Create a circular clipping mask
          ctx.beginPath();
          ctx.arc(
            canvasSize / 2,
            canvasSize / 2,
            canvasSize / 2,
            0,
            Math.PI * 2,
          );
          ctx.closePath();
          ctx.clip();

          // Apply grayscale filter
          ctx.filter = "grayscale(100%)";

          // Calculate scale for "object-fit: cover"
          const scale = Math.max(
            canvasSize / imgElement.width,
            canvasSize / imgElement.height,
          );
          const newWidth = imgElement.width * scale;
          const newHeight = imgElement.height * scale;
          const offsetX = (canvasSize - newWidth) / 2;
          const offsetY = (canvasSize - newHeight) / 2;

          // Draw the image within the circular area
          ctx.drawImage(imgElement, offsetX, offsetY, newWidth, newHeight);

          // Convert the canvas to a data URL
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
          onChange={(e) => set("firstName", safeParseFieldString(e))}
          value={data.firstName}
        />
        <Field
          label="Last Name"
          required
          onChange={(e) => set("lastName", safeParseFieldString(e))}
          value={data.lastName}
        />
        <Field
          label="Position"
          required
          onChange={(e) => set("position", safeParseFieldString(e))}
          value={data.position}
        />
        <Field
          label="Telephone"
          required
          onChange={(e) => set("telephone", safeParseFieldString(e))}
          value={data.telephone}
        />
        <Field
          label="Address Line 1"
          required
          onChange={(e) => set("addressLine1", safeParseFieldString(e))}
          value={data.addressLine1}
        />
        <Field
          label="Address Line 2"
          onChange={(e) => set("addressLine2", safeParseFieldString(e))}
          value={data.addressLine2}
        />
        <Field label="Image" type={FormOptionType.FILE} onFile={getBinary} />
      </article>
      <article
        className={styles.signature_container}
        onClick={selectSignature}
        ref={signatureContainerRef}
      >
        {" "}
        {isValid() ? (
          <div ref={signatureRef}>
            <p
              style={{
                color: "#0C0C0C",
                fontFamily: "Arial",
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "130%",
              }}
            >
              Beste
              <br />
              <br />
              Text
              <br />
              <br />
              Alvast bedankt.
              <br />
              <br />
              Met vriendelijke groeten / Kind regards
              <br />
              <br />
            </p>
            <table>
              <tbody>
                <tr>
                  <td
                    style={{
                      paddingRight: "11px",
                      width: "160px",
                      borderRight: "1px solid #E5E4E4",
                      verticalAlign: "top",
                    }}
                  >
                    <div
                      style={{
                        paddingBottom: "24px",
                      }}
                    >
                      <img
                        src={data.image}
                        alt="Profile Picture"
                        style={{
                          width: "122px",
                          height: "122px",
                        }}
                      />
                    </div>
                    <div>
                      <img
                        src={data.logo}
                        alt="LyttleDevelopment Logo"
                        style={{
                          width: "120px",
                          height: "43px",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      paddingLeft: "45px",
                      verticalAlign: "top",
                    }}
                  >
                    <p
                      style={{
                        color: "#100429",
                        fontFamily: "Arial",
                        fontSize: "13px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "18px",
                      }}
                    >
                      <span
                        style={{
                          color: "#100429",
                          fontFamily: "Arial",
                          fontSize: "13px",
                          fontStyle: "normal",
                          fontWeight: "700",
                          lineHeight: "18px",
                        }}
                      >
                        {data.firstName || "John"} {data.lastName || "Doe"}
                      </span>
                      <br />
                      {data.position || "Placeholder"}T <br />
                      <br />
                      {formatTelephone(data.telephone)}
                      <br />
                      <br />
                      {data.addressLine1}
                      <br />
                      {data.addressLine2}
                      <br />
                    </p>
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style={{
                                color: "#100429",
                                fontFamily: "Arial",
                                fontSize: "11px",
                                fontStyle: "normal",
                                fontWeight: "400",
                                lineHeight: "16px",
                              }}
                            >
                              Ontdek de succesverhalen
                              <br />
                              via{" "}
                              <a href="https://www.lyttledevelopment.com/?ref=email-signature">
                                lyttledevelopment.com
                              </a>
                            </p>
                          </td>
                          <td
                            style={{
                              paddingLeft: "65px",
                            }}
                          >
                            <p
                              style={{
                                paddingTop: "20px",
                                color: "#100429",
                                fontFamily: "Arial",
                                fontSize: "11px",
                                fontStyle: "normal",
                                fontWeight: "700",
                                lineHeight: "18px",
                              }}
                            >
                              Let’s make the Lyttle details,
                              <br />
                              become a lasting impression!
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <p
              style={{
                color: "#0C0C0C",
                fontFamily: "Arial",
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "130%",
              }}
            >
              Please fill in all required fields before copying the signature.
            </p>
          </>
        )}
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
