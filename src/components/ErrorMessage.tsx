export default function ErrorMessage({ message } : { message: string | null }) {
    return (
        <p
          className={`flex items-center gap-2 text-sm font-bold text-white bg-red-600 px-3 py-2 rounded-md transition-all duration-300 ${
            message ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          {message || " "}
        </p>
    );
}