import React from 'react';

const AboutMe = () => {
  // Placeholder data - replace with your actual data
  const skills = [
    { name: 'Full Stack Web Development' },
    { name: 'Ruby on Rails' },
    { name: 'React.js' },
  ];

  const featuredPost = {
    title: 'Hello world!',
    excerpt: 'First post generated with homemade ruby on rails Obsidian plugin!',
    image: 'https://media.cleanshot.cloud/media/116489/jFVa66sEMBOAQsH2J7UZEvwSsrFvsjylRHKQswIl.jpeg?Expires=1743158668&Signature=Ij2a3Fn41ty2S~Luq9VTc2ah11E8GEZ8irCF70v6TkL~bHhqYlnbdk221Hb2cofDLVk3Gr0IebSIAFbm6NuteYVqGSAmikWlhliUp~MzSU3IpwA4dDa3F5LoVMbLo5iKvlxi7Yxs9uXNmxwbsSM2pZ0~Em8ziQTGubZS-R338mslML45hiWw1gbOy8HPSUe1eblsLML9bFCflIJ0jIBeHHlmsdz~lmfcdXlxFfKusZtqmePxKfWrssmJlyYdzIoIZIOz-XN2TB1WF0tHcINwzSHVz7gjWLI923jYPYSi7PdQIaQC2jSxeDlcx5PcpLbuC4l~1SbF-wpBugxnLzcsVw__&Key-Pair-Id=K269JMAT9ZF4GZ', // Replace with your image URL
    url: '/blog/hello-world',
    date: 'March 25, 2025',
  };

  const favoriteItems = [
    {
      category: 'Development Tools',
      items: [
        { name: 'VS Code', description: 'My primary code editor', image: 'https://example.com/vscode.png', url: 'https://code.visualstudio.com/' },
        { name: 'Figma', description: 'Design and prototyping', image: 'https://example.com/figma.png', url: 'https://figma.com/' },
      ],
    },
    {
      category: 'Learning Resources',
      items: [
        { name: 'Frontend Masters', description: 'Advanced web courses', image: 'https://example.com/fem.png', url: 'https://frontendmasters.com/' },
        { name: 'MDN Web Docs', description: 'Web documentation', image: 'https://example.com/mdn.png', url: 'https://developer.mozilla.org/' },
      ],
    },
  ];

  return (
    <div className="bg-black text-white w-full h-screen overflow-y-auto absolute top-0 left-0 right-0 bottom-0">
      <main className="py-6 px-6 ml-16 transition-all duration-300" id="about-me-content">
        <div className="max-w-4xl mx-auto">
          {/* Domain name header */}
          <div className="text-center text-2xl font-mono mb-12 border border-gray-700 rounded-md p-4">
            austn.net
          </div>
          
          {/* Hero Section */}
          <div className="border border-gray-700 rounded-md p-8 mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                <img src="https://media.cleanshot.cloud/media/116489/cGiRbWkYvgyqOEu4m9Zxp4TU472lZC5ndogFSrMu.jpeg?Expires=1743156553&Signature=qEerqoPdxQHg0ga5v0VZQJwtHjYbfPXpQ~R2dgLr39Hfdl7EtoipnDdbXojmePDPB96bRXb-X3dIAeMndhC5WGCLNPBSqvbAKelOPPRlN7~CjuK3w197j4tRt68Nb~IxMJQjWPdYy5l1McT9aVoNzMnRv8iOsSPw-US7RlQhyiHkdaVhmjoKUbdJVLKEiZyF0fln0w6kS~ZCcjcc0OpwjVmx2inRR9TtPOlCnUlQIWrbKkxR2Dii4l0dnCZH7ZD4RqUf4q4edb48Xis91UHzWBJXLobNraIoLnG~553CFPpgRjXzZlhLsV2rVtrq8XA8aB195ElcBtP-6Y96b6pXcQ__&Key-Pair-Id=K269JMAT9ZF4GZ"></img>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">Austin!</h1>
              <p className="text-xl text-gray-300 mb-6">Software Engineer</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill) => (
                  <span key={skill.name} className="px-3 py-1 rounded-full text-sm bg-gray-800">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* About Me Section */}
          <div className="border border-gray-700 rounded-md p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">About Me</h2>
            <p className="text-gray-300">
              I'm a passionate full-stack developer with expertise in React and Ruby on Rails. 
              With over 5 years of experience building web applications, I focus on creating 
              intuitive, performant user experiences with clean, maintainable code.
            </p>
          </div>
          
          {/* Featured Post */}
          <div className="border border-gray-700 rounded-md p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Post</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="aspect-video bg-gray-800 rounded-md overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={`${featuredPost.image}`}></img>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-xl font-medium mb-2">{featuredPost.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{featuredPost.date}</p>
                <p className="text-gray-300 mb-4">{featuredPost.excerpt}</p>
                <a 
                  href={featuredPost.url} 
                  className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Read More
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Favorite Items */}
          <div className="border border-gray-700 rounded-md p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">My Favorite Things</h2>
            
            {favoriteItems.map((category) => (
              <div key={category.category} className="mb-8 last:mb-0">
                <h3 className="text-xl font-medium mb-4">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <a 
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start p-4 rounded-md border border-gray-700 hover:bg-gray-800 transition-all"
                    >
                      <div className="mr-4 w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center">
                        {/* Replace with actual image */}
                        <span className="text-gray-500 text-xs">{item.name.substring(0, 2)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium group-hover:text-white transition-colors">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutMe;