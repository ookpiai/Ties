const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Minimalist UI Kit',
      creator: 'Alex Johnson',
      category: 'Design',
      likes: 245,
      image: 'https://source.unsplash.com/random/600x400?design',
    },
    {
      id: 2,
      title: 'Mountain Landscape',
      creator: 'Sarah Miller',
      category: 'Photography',
      likes: 189,
      image: 'https://source.unsplash.com/random/600x400?mountain',
    },
    {
      id: 3,
      title: 'E-commerce Platform',
      creator: 'Dev Team',
      category: 'Development',
      likes: 312,
      image: 'https://source.unsplash.com/random/600x400?ecommerce',
    },
    {
      id: 4,
      title: 'Abstract Art Collection',
      creator: 'Maria Garcia',
      category: 'Art',
      likes: 156,
      image: 'https://source.unsplash.com/random/600x400?abstract',
    },
    {
      id: 5,
      title: 'Creative Writing: The Journey',
      creator: 'James Wilson',
      category: 'Writing',
      likes: 98,
      image: 'https://source.unsplash.com/random/600x400?book',
    },
    {
      id: 6,
      title: 'Ambient Soundtrack',
      creator: 'DJ Nova',
      category: 'Music',
      likes: 423,
      image: 'https://source.unsplash.com/random/600x400?music',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Projects</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-300">Discover the latest creative work from our community</p>
            </div>
            <div className="flex space-x-4">
              <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>All Categories</option>
                <option>Design</option>
                <option>Photography</option>
                <option>Development</option>
                <option>Art</option>
                <option>Writing</option>
                <option>Music</option>
              </select>
              <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Most Popular</option>
                <option>Newest First</option>
                <option>Most Viewed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="card overflow-hidden">
                <div className="relative h-48 w-full">
                  <img
                    className="w-full h-full object-cover"
                    src={project.image}
                    alt={project.title}
                  />
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-medium text-gray-800 dark:text-white shadow-sm">
                    {project.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">by {project.creator}</p>
                  <div className="mt-4 flex items-center">
                    <button className="flex items-center text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="ml-1">{project.likes}</span>
                    </button>
                    <button className="ml-4 flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="ml-1">Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-blue-600 text-white px-4 py-2 border border-blue-600 text-sm font-medium"
              >
                1
              </a>
              <a
                href="#"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                2
              </a>
              <a
                href="#"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                3
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
