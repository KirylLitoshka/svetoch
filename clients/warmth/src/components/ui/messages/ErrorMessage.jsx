import "./Messages.css";

const ErrorMessage = ({ message }) => {
  return (
    <div className="message">
      <div className="message_error">{message}</div>
    </div>
  );
};

export default ErrorMessage;
