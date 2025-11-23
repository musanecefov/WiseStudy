import {Link,useNavigate} from 'react-router-dom';
import {useState} from "react";
export default function SignupForm(){

    const [formData, setFormData] = useState({
        username:'',
        email:'',
        password:'',
        password_confirmation:''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError('Şifrələr uyğun deyil.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return(
        <>
            <section className=" flex items-center justify-center font-mono bg-gradient-to-r from-cyan-500 from-10% via-indigo-500 via-50% to-sky-500 to-100% py-16">
                <div className="flex shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center p-15 gap-8 bg-white rounded-lg">
                        <img
                            src="/wisestudy.logo.png"  // replace with your actual image path
                            alt="Logo"
                            className="w-24 h-24 object-contain mx-auto"
                        />

                        <h1 className="text-3xl font-bold">Xoş gəlmisiniz!</h1>

                        {error && <p className="text-red-500">{error}</p>}

                        <div className="flex flex-col text-xl text-left gap-1">
                            <span>İstifadəçi adı</span>
                            <input type="text"  placeholder="İstifadəçi adı" name="username"  value={formData.username} onChange={handleChange} className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50" required />
                        </div>

                        <div className="flex flex-col text-xl text-left gap-1">
                            <span>Email</span>
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50" required  />
                        </div>

                        <div className="flex flex-col text-xl text-left gap-1">
                            <span>Şifrə</span>
                            <input type="password"  name="password" placeholder="Şifrə" value={formData.password} onChange={handleChange} className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50" required />
                        </div>

                        <div className="flex flex-col text-xl text-left gap-1">
                            <span>Şifrəni təsdiqlə</span>
                            <input  name="password_confirmation" type="password" placeholder="Şifrəni təsdiqlə" value={formData.password_confirmation} onChange={handleChange} className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50" required />
                        </div>

                        <div className="flex gap-1 items-center">
                            <input type="checkbox" required/>
                            <span className="text-base"><button className="hover:underline">İstifadə şərtləri</button> ilə razıyam.</span>
                        </div>

                        <button type="submit" className="px-10 py-2 text-2xl rounded-md bg-gradient-to-tr from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white">Qeydiyyatdan keç</button>
                        <p className="font-semibold">Artıq hesabın var? <Link to="/login" className="text-blue-400 hover:underline">Daxil olun</Link></p>
                    </form>
                </div>
            </section>
        </>
    )
}