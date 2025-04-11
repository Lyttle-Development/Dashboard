import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import React, { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { safeParseFieldString } from "@/lib/parse";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Signature: ArcelorMittal" });
  const [data, setData] = useState({
    firstName: "Kilian",
    lastName: "De Bock",
    position: "IBO Assistent | Human Resources & Progress Academy",
    telephone: "+32 (0)93 47 49 35",
    addressLine1: "John Kennedylaan 51, B-9042 Gent",
    addressLine2: "(Hoofdgebouw, bureau 1510)",
    image: "",
    logo: "",
    gradient: "",
  });

  // Fetch the logo data URL when the component mounts
  useEffect(() => {
    fetch("/logo/arcelormittal/logo.svg")
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
    fetch("/logo/arcelormittal/gradient.svg")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Once converted, store the logo data URL in state
          setData((prev) => ({
            ...prev,
            gradient: reader.result as string,
          }));
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.error("Error fetching the gradient:", error);
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

    const container = signatureRef.current;
    if (!container) return;

    const html = container.innerHTML;

    // Add "coping" class
    signatureContainerRef.current.classList.add(styles.coping);

    // Use Clipboard API
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([""], { type: "text/plain" }), // disable plain text fallback
        }),
      ])
      .then(() => {
        window.alert("Signature copied to clipboard!");
      })
      .catch((err) => {
        console.error("Clipboard write failed", err);
        window.alert("Failed to copy the signature.");
      })
      .finally(() => {
        // Remove "coping" class
        signatureContainerRef.current.classList.remove(styles.coping);
      });
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
        const canvasSizeX = 8.875 * 16;
        const canvasSizeY = 9.25 * 16;
        const canvas = document.createElement("canvas");
        canvas.width = canvasSizeX;
        canvas.height = canvasSizeY;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Calculate scale for "object-fit: cover"
          const scale = Math.max(
            canvasSizeX / imgElement.width,
            canvasSizeY / imgElement.height,
          );
          const newWidth = imgElement.width * scale;
          const newHeight = imgElement.height * scale;
          const offsetX = (canvasSizeX - newWidth) / 2;
          const offsetY = (canvasSizeY - newHeight) / 2;

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
            <table
              style={{
                position: "relative",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      width: 11 * 16 + "px",
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
                          width: 8.875 * 16 + "px",
                          height: 9.25 * 16 + "px",
                          position: "absolute",
                          bottom: "0",
                          left: 0.8 * 16 + "px",
                          zIndex: 1,
                        }}
                      />
                      <img
                        src={data.gradient}
                        alt="ArcelorMittal Gradient"
                        style={{
                          width: 8.6875 * 16 + "px",
                          height: 10.9375 * 16 + "px",
                          position: "absolute",
                          bottom: "0",
                          left: "0",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      verticalAlign: "top",
                    }}
                  >
                    <table
                      style={{
                        width: 32 * 16 + "px",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td>
                            <span
                              style={{
                                color: "#000",
                                textAlign: "center",
                                fontFamily: "Arial",
                                fontSize: 16 + "px",
                                fontStyle: "normal",
                                fontWeight: 400,
                                lineHeight: 1.25 * 16 + "px",
                              }}
                            >
                              {data.firstName || "John"}{" "}
                              {data.lastName || "Doe"}
                            </span>
                          </td>
                          <td
                            style={{
                              marginLeft: "auto",
                              width: 5 * 16 + "px",
                            }}
                          >
                            <div>
                              <img
                                src={data.logo}
                                alt="ArcelorMittal Logo"
                                style={{
                                  width: "120px",
                                  height: "43px",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p
                      style={{
                        color: "#333",
                        fontFamily: "Arial",
                        fontSize: 0.6875 * 16 + "px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "130%",
                      }}
                    >
                      <br />
                      {data.position || "Placeholder"}
                      <br />
                      <br />
                      <span
                        style={{
                          color: "#F25900",
                          fontFamily: "Arial",
                          fontSize: 0.6875 * 16 + "px",
                          fontStyle: "normal",
                          fontWeight: "700",
                          lineHeight: "130%",
                        }}
                      >
                        T {formatTelephone(data.telephone)}
                      </span>
                      <br />
                      <span
                        style={{
                          color: "#000",
                          fontFamily: "Arial",
                          fontSize: 0.6875 * 16 + "px",
                          fontStyle: "normal",
                          fontWeight: "400",
                          lineHeight: "130%",
                        }}
                      >
                        Of{" "}
                        <a
                          href="?"
                          style={{
                            color: "#F25900",
                            fontFamily: "Arial",
                            fontSize: 0.6875 * 16 + "px",
                            fontStyle: "normal",
                            fontWeight: "400",
                            lineHeight: "130%",
                            textDecorationLine: "underline",
                          }}
                        >
                          chat in Teams
                        </a>
                      </span>
                      <br />
                      <br />
                      {data.addressLine1}
                      <br />
                      {data.addressLine2}
                      <br />
                      <br />
                      <span
                        style={{
                          display: "block",
                          width: 32 * 16 + "px",

                          color: "#333",
                          fontFamily: "Arial",
                          fontSize: 0.625 * 16 + "px",
                          fontStyle: "normal",
                          fontWeight: "400",
                          lineHeight: "130%",
                        }}
                      >
                        PS: Gelieve uw IBO gerichte vragen voor Human Resources
                        naar{" "}
                        <a href="mailto:hrdigitalisation@arcelormittal.com">
                          hrdigitalisation@arcelormittal.com
                        </a>{" "}
                        te sturen & voor IBO vragen voor Progress Academy naar{" "}
                        <a href="mailto:gen-pac-ibo@arcelormittal.com">
                          gen-pac-ibo@arcelormittal.com
                        </a>{" "}
                        te sturen.
                      </span>
                    </p>
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
