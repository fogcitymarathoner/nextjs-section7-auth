import AuthForm from '@/components/auth-form';

export default async function Home( {searchParams}) {
  const formMode = searchParams.mode || 'login'
  console.log('Home component')
  console.log('searchParams ' + Object.keys(searchParams))
  console.log('searchParams.mode ' + searchParams.mode)
  console.log('formMode ' + formMode)
  return <AuthForm mode={formMode}/>;
}
