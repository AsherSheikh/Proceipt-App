import { useContext } from 'react';
import { CustomerContext } from '../context/customer_context';

const useCustomer = () => {
  const customerContext = useContext(CustomerContext);

  if (!customerContext) {
    throw new Error('useCustomer must be used within an CustomerProvider');
  }
  return customerContext;
};

export default useCustomer;
