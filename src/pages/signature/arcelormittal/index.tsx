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
  const buildCleanSignatureHtml = () => {
    return `
    <p style="color:#0C0C0C;font-family:Arial;font-size:12px;line-height:130%">
      Beste<br><br>
      Text<br><br>
      Alvast bedankt.<br><br>
      Met vriendelijke groeten / Kind regards<br>
    </p>
    <table style="position:relative">
      <tbody>
        <tr>
          <td style="width:${10 * 16 + "px"};vertical-align:top">
            <img src="${data.gradient}" alt="" style="position:absolute;bottom:0;left:0;width:139px;height:175px;" />
            <img src="${data.image}" alt="Profile" style="position:absolute;bottom:0;left:13px;width:142px;height:148px;z-index:1;" />
          </td>
          <td style="vertical-align:top;padding-left:8px">
            <table style="width: ${32 * 16 + "px"};margin-top: 16px;">
              <tr>
                <td>
                  <span style="font-family:Arial;font-size:16px;color:#000;">
                    ${data.firstName} ${data.lastName}
                  </span>
                  <br>
                  <span style="font-family:Arial;font-size:11px;color:#333;">
                      ${data.position}
                  </span>
                </td>
                <td style="margin-left:auto;width: ${5 * 16 + "px"}">
                  <img src="${data.logo}" alt="Logo" style="width:120px;height:43px;" />
                </td>
              </tr>
            </table>
            <div style="font-family:Arial;font-size:11px;color:#333;width: ${32 * 16 + "px"};margin-bottom:-8px;">
              <strong style="color:#F25900;">T ${formatTelephone(data.telephone)}</strong><br>
              Of <a href="?" style="color:#F25900;text-decoration:underline;">chat in Teams</a><br><br>
              ${data.addressLine1}<br>
              ${data.addressLine2}<br><br>
              <span style="font-size:10px;">
                PS: Gelieve uw IBO gerichte vragen voor Human Resources naar
                <a href="mailto:hrdigitalisation@arcelormittal.com">hrdigitalisation@arcelormittal.com</a>
                te sturen & voor IBO vragen voor Progress Academy naar
                <a href="mailto:gen-pac-ibo@arcelormittal.com">gen-pac-ibo@arcelormittal.com</a> te sturen.
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `;
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

    const html = buildCleanSignatureHtml();

    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([""], { type: "text/plain" }),
        }),
      ])
      .then(() => {
        window.alert("Signature copied to clipboard!");
      })
      .catch((err) => {
        console.error("Clipboard write failed", err);
        window.alert("Failed to copy the signature.");
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
          <div
            ref={signatureRef}
            dangerouslySetInnerHTML={{ __html: buildCleanSignatureHtml() }}
          />
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
