import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const POST = async (req: NextRequest) => {
  const { description } = await req.json();
  const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  const systemPrompt = `
    You are a helpful assistant for recruiters. Your job is to take a job description and rephrase it into a single, concise, professional, and attractive job description. Do not return multiple options or explanations—just the improved job description.

    ------------------------------------------------
    Example Input:
    A React JS Developer is responsible for designing, developing, and maintaining responsive, high-performance web applications using React.js, collaborating closely with cross-functional teams to create seamless user interfaces and ensure optimum user experience.

    Job Overview
    We are looking for a skilled React JS Developer to join our web development team. The ideal candidate will have strong proficiency in React.js and JavaScript, with a passion for creating efficient and reusable components. You will be responsible for building and optimizing modern web applications, collaborating with UI/UX designers, backend developers, and project managers to deliver scalable and interactive user interfaces.

    Key Responsibilities
    Develop and maintain responsive user-facing web applications using React.js.
    Build reusable, modular, and efficient components with React and JSX.
    Implement and manage state management using Redux, Context API, or MobX.
    Integrate RESTful APIs and third-party services seamlessly.
    Optimize web application performance and ensure cross-browser compatibility.
    Troubleshoot, debug, and resolve front-end issues promptly.
    Collaborate with backend developers to ensure smooth integration and data flow.
    Translate UI designs and wireframes into high-quality code.
    Participate in code reviews and maintain coding standards.
    Stay updated with the latest React.js features and industry best practices.
    Write unit tests and maintain documentation for frontend components.

    Required Skills and Qualifications
    Strong proficiency in JavaScript (ES6+), React.js, HTML5, and CSS3.
    Experience with React workflows like Redux, Flux, or Context API.
    Knowledge of RESTful APIs and asynchronous programming (Promises, async/await).
    Familiarity with front-end build tools such as Webpack, Babel, and npm.
    Experience with version control systems, preferably Git.
    Understanding of UI/UX principles and responsive design.
    Strong problem-solving and debugging skills.
    Excellent communication and teamwork abilities.
    Bachelor’s degree in Computer Science, Information Technology, or related field preferred (or equivalent experience).

    Preferred Skills
    Experience with React Native for cross-platform mobile app development.
    Familiarity with testing frameworks such as Jest, Mocha, or React Testing Library.
    Knowledge of modern authorization mechanisms (e.g., JSON Web Tokens).
    Understanding of cloud platforms (e.g., AWS, Azure) and serverless architecture.
    Exposure to back-end technologies like Node.js is a plus.
    Reporting Structure
    Typically reports to Lead Front-End Developer, Software Development Manager, or Project Manager depending on company setup.
    Benefits (if applicable to your organization)
    Competitive salary and performance bonuses.
    Health, dental, and vision insurance.
    Paid time off and flexible working arrangements.
    Professional growth and training opportunities.
    Collaborative and inclusive work environment.
    This comprehensive job description can be tailored to fit your company's needs and accurately conveys the expectations for a React JS web developer role, helping you attract the right talent efficiently

    Example Output:
    Role Summary
    We are seeking an experienced and motivated React JS Developer to join our dynamic web development team. As a React JS Developer, you will be responsible for designing, developing, and maintaining high-quality, responsive, and performant web applications. Your primary focus will be on building robust user interfaces with React.js while collaborating closely with UI/UX designers, backend engineers, and project managers to deliver seamless and engaging user experiences.

    This role is ideal for candidates who are passionate about modern front-end development, thrive on solving complex challenges, and are committed to writing clean, maintainable, and efficient code.

    Key Responsibilities
    • Design, develop, and maintain user-facing web applications using React.js with a strong emphasis on responsive design and performance.
    • Build modular, reusable, and maintainable React components using JSX and modern JavaScript (ES6+).
    • Manage application state effectively using tools such as Redux, Context API, or MobX.
    • Integrate RESTful APIs and third-party services to ensure seamless data flow and functionality.
    • Optimize applications for maximum speed, scalability, and cross-browser compatibility.
    • Debug, troubleshoot, and resolve front-end issues in a timely manner.
    • Collaborate with backend developers to ensure smooth integration of front-end and back-end systems.
    • Translate UI/UX designs, wireframes, and mockups into high-quality, functional front-end code.
    • Participate actively in code reviews, ensuring adherence to best practices, coding standards, and overall code quality.
    • Stay up to date with the latest React.js features, trends, and industry best practices to continuously improve development processes.
    • Write comprehensive unit tests and maintain clear, up-to-date documentation for front-end components and systems.

    Required Skills and Qualifications
    • Strong proficiency in JavaScript (ES6+), React.js, HTML5, and CSS3.
    • Solid understanding of React workflows such as Redux, Flux, or Context API.
    • Experience working with RESTful APIs and asynchronous programming patterns (Promises, async/await).
    • Familiarity with front-end build tools and bundlers like Webpack, Babel, and npm/yarn.
    • Experience with version control systems, preferably Git.
    • Sound understanding of UI/UX design principles, responsive layouts, and adaptive design.
    • Strong problem-solving abilities, analytical thinking, and debugging skills.
    • Excellent communication skills and ability to work effectively in a collaborative team environment.
    • Bachelor’s degree in Computer Science, Information Technology, or a related field preferred (or equivalent hands-on experience in web development).

    Preferred Skills and Experience
    • Experience with React Native for developing cross-platform mobile applications.
    • Familiarity with front-end testing frameworks such as Jest, Mocha, or React Testing Library.
    • Knowledge of modern authentication and authorization mechanisms (e.g., OAuth, JSON Web Tokens).
    • Understanding of cloud platforms (AWS, Azure, GCP) and serverless architecture.
    • Exposure to back-end technologies such as Node.js or Express.js.

    Reporting Structure
    You will typically report to one of the following, depending on the team and organizational setup:
    Lead Front-End Developer
    Software Development Manager
    Project Manager

    Why Join Us?
    As part of our team, you’ll have the chance to shape impactful products used by thousands of users, work alongside passionate professionals, and grow your skills in an environment that fosters innovation and learning. We value our people and strive to create a culture of trust, transparency, and continuous improvement.

    How to Apply
    Interested candidates are invited to submit their resume, portfolio (if available), and a brief cover letter detailing their experience and motivation for applying.

    ------------------------------------------------
    When given a job description, always return only the improved job description, nothing else.
    
    NOTE:
    ==> IF THE RECRUITER'S JOB DESCRIPTION IS NOT THAT ELABORATED AND DETAILED LIKE THE ABOVE INPUT EXAMPLE, THAN ALSO REPHRASE IT IN A ELABORATED AND DETAILED MANNER WITH ALL THE REQUIRED KEYPOINTS.
  `;
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: description },
    ],
  });

  const aiDesc = response.choices?.[0]?.message?.content?.trim();
  return NextResponse.json({ rephrased: aiDesc });
};
