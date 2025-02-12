import { NextPageContext } from "next";
import { Layout } from "@/layouts";

export interface ErrorPageProps {
  code: number;
  message: string;
}

function ErrorPage({ code, message }: ErrorPageProps) {
  return (
    <Layout.Default>
      <h1>Error!</h1>
      <p>
        {code
          ? `An error ${code} occurred on server`
          : "An error occurred on client"}
      </p>
    </Layout.Default>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  let code = 404;
  if (res && res.statusCode) code = res.statusCode;
  if (err && err.statusCode) code = err.statusCode;

  let message = "Page was not found";
  if (res && res.statusMessage) message = res.statusMessage;
  if (err && err.message) message = err.message;

  return { code, message };
};

export default ErrorPage;
