import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
      <div className="max-w-lg mx-auto">
        <p className="text-lg text-center mb-8">
          We'd love to hear from you! Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
        </p>
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Email</h3>
              <a href="mailto:hello@airola.co.uk" className="text-blue-500 hover:underline">Contact@airola.co.uk</a>
            </div>
            <div>
              <h3 className="font-bold">Phone</h3>
              <a href="tel:+442079460123" className="text-blue-500 hover:underline">+44 7925123219</a>
            </div>
            <div>
              <h3 className="font-bold">Address</h3>
              <p>London, UK</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
