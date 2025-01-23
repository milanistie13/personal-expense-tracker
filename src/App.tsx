import React, { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import * as XLSX from 'xlsx'
import './App.css'

const exportToExcel = async (expenses: Expense[]) => {
  try {
    // Show loading state
    const downloadBtn = document.querySelector('.download-btn') as HTMLButtonElement | null;
    if (downloadBtn) {
      downloadBtn.textContent = 'Menyiapkan laporan...';
      downloadBtn.disabled = true;
    }

    // Simulate delay for large datasets
    await new Promise(resolve => setTimeout(resolve, 500));

    const worksheet = XLSX.utils.json_to_sheet(expenses.map(expense => ({
      Tanggal: expense.date,
      Kategori: expense.category,
      Deskripsi: expense.description,
      Jumlah: expense.amount
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pengeluaran");
    
    XLSX.writeFile(workbook, "laporan-pengeluaran.xlsx");
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Gagal membuat laporan. Silakan coba lagi.');
  } finally {
    // Reset button state
    const downloadBtn = document.querySelector('.download-btn') as HTMLButtonElement | null;
    if (downloadBtn) {
      downloadBtn.textContent = 'Unduh Excel';
      downloadBtn.disabled = false;
    }
  }
}

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryColors = {
  'Fauzi': '#ec407a',
  'Frien': '#ffa726',
  'Dapur': '#66bb6a',
  'Snack': '#42a5f5',
  'Harian': '#ab47bc',
  'Transportasi': '#78909c',
  'Rumah': '#4CAF50',
  'Uwais': '#FF7043',
  'Tak Terduga': '#8D6E63'
};

const categories = Object.keys(categoryColors)



interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number | string;
}


const App = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    date: string;
    category: string;
    description: string;
    amount: string;
  }>({
      date: new Date().toISOString().split('T')[0],
      category: categories[0],
      description: '',
      amount: ''
    })
  const [allDescriptions, setAllDescriptions] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const savedExpenses: Expense[] = JSON.parse(localStorage.getItem('expenses') || '[]')
    setExpenses(savedExpenses)
    
    // Get all unique descriptions from saved expenses
    const descriptions = [...new Set(savedExpenses.map(exp => exp.description))] as string[]
    setAllDescriptions(descriptions)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // If description changed, update suggestions
    if (name === 'description') {
      const filteredSuggestions = allDescriptions.filter(desc => 
        desc.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filteredSuggestions)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, description: suggestion }))
    setSuggestions([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newExpense = {
      ...formData,
      id: Date.now(),
      amount: Number(formData.amount)
    }
    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: categories[0],
      description: '',
      amount: ''
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id)
      setExpenses(updatedExpenses)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    }
  }

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan.')) {
      setExpenses([])
      localStorage.removeItem('expenses')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: categories[0],
        description: '',
        amount: ''
      })
    }
  }

  const totalExpenses = expenses.reduce((sum: number, expense: Expense) => {
    const amount = Number(expense.amount);
    if (!isNaN(amount)) {
      return sum + amount;
    }
    return sum;
  }, 0)

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Total Pengeluaran',
        data: categories.map(cat => 
          expenses
            .filter(exp => exp.category === cat)
            .reduce((sum: number, exp: Expense) => {
              const amount = parseFloat(exp.amount.toString());
              if (!isNaN(amount)) {
                return sum + amount;
              }
              return sum;
            }, 0)
        ),
        backgroundColor: Object.values(categoryColors)
      }
    ]
  }

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>

      <h1>Pelacak Pengeluaran</h1>

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Tanggal:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Kategori:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Deskripsi:</label>
          <div className="description-input">
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Masukkan deskripsi pengeluaran"
              required
            />
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Jumlah (IDR):</label>
          <input
            type="text"
            name="amount"
            value={formData.amount ? Number(formData.amount.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, '');
              handleInputChange({
                target: {
                  name: 'amount',
                  value: rawValue
                }
              });
            }}
            placeholder="Masukkan jumlah"
            required
          />
        </div>

        <button type="submit">Tambah Pengeluaran</button>
      </form>

      <div className="summary">
        <h2>Ringkasan Bulan Ini</h2>
        <p>Total Pengeluaran: Rp {totalExpenses.toLocaleString('id-ID')}</p>
        <div className="chart-container">
          <Pie data={chartData} />
        </div>
      </div>

      <div className="expense-list">
        <h2>Daftar Pengeluaran</h2>
        {expenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            const today = new Date();
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // Check if dates are valid before comparison
            if (isNaN(expenseDate.getTime()) || isNaN(today.getTime()) || isNaN(firstOfMonth.getTime())) {
              return false;
            }
            return expenseDate >= firstOfMonth && expenseDate <= today;
          })
          .map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-details">
              <span>{expense.date}</span>
              <span className={`category-${expense.category.toLowerCase().replace(/ /g, '-')}`}>
                {expense.category}
              </span>
              <span>{expense.description}</span>
              <span>Rp {expense.amount.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => handleDelete(expense.id)}
              className="delete-btn"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleReset}
          className="reset-btn"
        >
          Reset
        </button>
        
        <button 
          onClick={() => exportToExcel(expenses)}
          className="download-btn"
        >
          Unduh Excel
        </button>
      </div>
    </div>
  )
}

export default App
