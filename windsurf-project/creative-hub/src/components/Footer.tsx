const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} CreativeHub. All rights reserved.
            </span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Built with ❤️ for the creative community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
