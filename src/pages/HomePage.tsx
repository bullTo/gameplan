import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { loginUser, registerUser } from '@/api/auth'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog'

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('login')
  const navigate = useNavigate()
  const { toast } = useToast();
  const location = useLocation()

  useEffect(() => {
    // Check if there's a tab parameter in the URL
    const searchParams = new URLSearchParams(location.search)
    const tabParam = searchParams.get('tab')

    if (tabParam === 'register') {
      setActiveTab('register')
    }
  }, [location])

  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const registerForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      agreeToTerms: false,
    },
    mode: 'onBlur', // Validate on blur for better user experience
  })

  const onLoginSubmit = async (data: any) => {
    try {
      console.log('Login data:', data);

      // Call the login API
      const response = await loginUser({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      });

      toast({
        title: "Login Successfully",
        description: response,
        variant: "destructive",
      });
      // Redirect to dashboard on successful login
      navigate('/account/dashboard');
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please try again.';

      if (errorMessage.includes('Invalid credentials')) {
        loginForm.setError('password', {
          type: 'manual',
          message: 'Invalid email or password'
        });
      } else {
        // Generic error handling
        alert(errorMessage);
      }
    }
  }

  const onRegisterSubmit = async (data: any) => {
    try {
      console.log('Register data:', data);

      // Check if user agreed to terms and conditions
      if (!data.agreeToTerms) {
        registerForm.setError('agreeToTerms', {
          type: 'manual',
          message: 'You must agree to the Terms and Conditions to register'
        });
        return;
      }

      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        registerForm.setError('confirmPassword', {
          type: 'manual',
          message: 'Passwords do not match'
        });
        return;
      }

      // Call the registration API
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        agreeToTerms: data.agreeToTerms
      });

      console.log(response)
      toast({
        title: "Registered Successfully",
        description: response,
        variant: "destructive",
      });
      
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Failed to register. Please try again.';

      if (errorMessage.includes('email already exists')) {
        registerForm.setError('email', {
          type: 'manual',
          message: 'This email is already registered'
        });
      } else if (errorMessage.includes('password')) {
        registerForm.setError('password', {
          type: 'manual',
          message: errorMessage
        });
      } else {
        // Generic error handling
        alert(errorMessage);
      }
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#072730',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img
              src="/gameplan-ai-logo.png"
              alt="GamePlan AI Logo"
              style={{ height: '60px', width: 'auto' }}
            />
          </div>
          <p style={{ fontSize: '1rem', color: '#A1A1A2', marginTop: '0.5rem' }}>Sign in to your account or create a new one</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: '#0EADAB', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>←</span> Back to Home
          </Link>
        </div>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} style={{ width: '100%' }}>
          <TabsList className="grid grid-cols-2" style={{ backgroundColor: '#1B1C25', marginBottom: '1rem', width: '100%' }}>
            <TabsTrigger value="login" style={{
              color: activeTab === 'login' ? 'white' : undefined,
              backgroundColor: activeTab === 'login' ? '#0EADAB' : undefined
            }}>Login</TabsTrigger>
            <TabsTrigger value="register" style={{
              color: activeTab === 'register' ? 'white' : undefined,
              backgroundColor: activeTab === 'register' ? '#0EADAB' : undefined
            }}>Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card style={{ border: '1px solid #4E4E50', backgroundColor: '#1B1C25', color: 'white' }}>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <CardTitle style={{ fontSize: '1.5rem', color: '#0EADAB' }}>Login</CardTitle>
                <CardDescription style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              {...field}
                              style={{
                                backgroundColor: '#072730',
                                borderColor: '#4E4E50',
                                color: 'white'
                              }}
                            />
                          </FormControl>
                          <FormMessage style={{ color: '#D03E35' }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              style={{
                                backgroundColor: '#072730',
                                borderColor: '#4E4E50',
                                color: 'white'
                              }}
                            />
                          </FormControl>
                          <FormMessage style={{ color: '#D03E35' }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              style={{
                                borderColor: '#0EADAB',
                                backgroundColor: field.value ? '#0EADAB' : 'transparent'
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>
                              Remember me
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" style={{
                      width: '100%',
                      backgroundColor: '#0EADAB',
                      color: 'white',
                      marginTop: '0.5rem'
                    }}>
                      Login
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter style={{ display: 'flex', justifyContent: 'center', paddingTop: 0 }}>
                <ForgotPasswordDialog />
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card style={{ border: '1px solid #4E4E50', backgroundColor: '#1B1C25', color: 'white' }}>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <CardTitle style={{ fontSize: '1.5rem', color: '#0EADAB' }}>Register</CardTitle>
                <CardDescription style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Create a new account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              style={{
                                backgroundColor: '#072730',
                                borderColor: '#4E4E50',
                                color: 'white'
                              }}
                            />
                          </FormControl>
                          <FormMessage style={{ color: '#D03E35' }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              {...field}
                              style={{
                                backgroundColor: '#072730',
                                borderColor: '#4E4E50',
                                color: 'white'
                              }}
                            />
                          </FormControl>
                          <FormMessage style={{ color: '#D03E35' }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              style={{
                                backgroundColor: '#072730',
                                borderColor: '#4E4E50',
                                color: 'white'
                              }}
                            />
                          </FormControl>
                          <FormMessage style={{ color: '#D03E35' }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              style={{
                                backgroundColor: '#072730',
                                borderColor: '#4E4E50',
                                color: 'white'
                              }}
                            />
                          </FormControl>
                          <FormMessage style={{ color: '#D03E35' }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              style={{
                                borderColor: '#0EADAB',
                                backgroundColor: field.value ? '#0EADAB' : 'transparent'
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2' }}>
                              Remember me
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              style={{
                                borderColor: '#0EADAB',
                                backgroundColor: field.value ? '#0EADAB' : 'transparent'
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel style={{ fontSize: '0.875rem', color: '#A1A1A2', display: 'inline-flex', flexWrap: 'wrap' }}>
                              <span>By clicking Sign Up, you agree to our&nbsp;</span>
                              <Link to="/terms" style={{ color: '#0EADAB', textDecoration: 'underline' }}>
                                Terms and Conditions
                              </Link>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" style={{
                      width: '100%',
                      backgroundColor: '#0EADAB',
                      color: 'white',
                      marginTop: '0.5rem'
                    }}>
                      Register
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


      </div>
    </div>
  )
}

export default HomePage
