import { NextPageContext } from "next";
import { Layout } from "@/layouts";
import { Container } from "@/components/Container";

export interface ErrorPageProps {
  code: number;
  message: string;
}

function ErrorPage({ code, message }: ErrorPageProps) {
  return (
    <Layout.Default>
      <Container>
        <h1>Oh no!</h1>
        <h2>Something went wrong...</h2>
        <p>
          {code
            ? `An error ${code} occurred on server`
            : "An error occurred on client"}
        </p>
        <p>{message}</p>
      </Container>
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
